// pages/api/generate-load.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
import { randomInt } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { numSessions, numOrders, restockInterval = 200 } = req.body as {
    numSessions?: number;
    numOrders?: number;
    restockInterval?: number;
  };
  if (!numSessions || !numOrders) {
    return res
      .status(400)
      .json({ error: "numSessions and numOrders are required" });
  }

  const initiator = String(req.query.user || "admin@cockroachlabs.com");

  // --- 0) Preload all items (read-only) ---
  const allItems = await prisma.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true },
  });

  // --- 1) Create the LoadRun record ---
  const run = await runWithRetry((tx) =>
    tx.loadRun.create({
      data: { userEmail: initiator, numSessions, numOrders },
    }),
   "load-run-init"
  );

  // --- 2) Restock helper ---
  async function restockIfNeeded() {
    // Read current inventory
    const invs = await prisma.inventory.findMany({
      select: {
        id: true,
        itemId: true,
        onHand: true,
        threshold: true,
        restockAmount: true,
      },
    });
    const low = invs.filter((i) => i.onHand < i.threshold);
    if (low.length === 0) {
      console.log("↻ [restock] none below threshold");
      return;
    }

    console.log("↻ [restock] topping up SKUs:", low.map((i) => i.itemId));

    // Write updates in a transaction with retry-logging
    await runWithRetry((tx) =>
      Promise.all(
        low.map((inv) =>
          tx.inventory.update({
            where: { id: inv.id },
            data: {
              onHand: { increment: inv.restockAmount },
              transactions: {
                create: {
                  change:    inv.restockAmount,
                  type:      "RESTOCK",
                  reference: run.id,
                },
              },
            },
          })
        )
    ),
    "restock"
    );
  }

  // --- 3) Compute per‐session restock threshold ---
  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));
  console.log(
    `[generate-load] session 0 will restock every ${perSessionRestock} orders`
  );

  // --- 4) Launch sessions in parallel ---
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const username =
        idx === 0
          ? initiator
          : `${String(randomInt(0, 2000)).padStart(4, "0")}@cockroachlabs.com`;

      // 4a) Upsert user & cart
      const user = await runWithRetry((tx) =>
        tx.user.upsert({
          where: { email: username },
          update: {},
          create: { email: username },
        }),
        "upsert-user"
      );
      const cart = await runWithRetry((tx) =>
        tx.cart.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        }),
        "upsert-cart"
      );

      let sessionOrders = 0;
      const sessionStart = new Date();

      // 4b Each order in its own transaction
      for (let orderIndex = 0; orderIndex < numOrders; orderIndex++) {
        // Pick random items
        const count = randomInt(1, 9);
        const picked = allItems
          .map((it) => ({ ...it, rnd: Math.random() }))
          .sort((a, b) => a.rnd - b.rnd)
          .slice(0, count);
	// ✏️ enforce a stable order by primary key to avoid lock‐order cycles:
        picked.sort((a, b) => a.id.localeCompare(b.id));

        await runWithRetry(async (tx) => {
          // A Reserve each item
          await Promise.all(
            picked.map(({ id: itemId, stock }) => {
              const qty = stock > 1 ? randomInt(1, 4) : 1;
              return tx.cartItem
                .upsert({
                  where: { cartId_itemId: { cartId: cart.id, itemId } },
                  update: { quantity: { increment: qty } },
                  create: { cartId: cart.id, itemId, quantity: qty },
                })
                .then(() =>
                  tx.inventory.update({
                    where: { itemId },
                    data: {
                      reserved: { increment: qty },
                      transactions: {
                        create: {
                          change:    qty,
                          type:      "RESERVE",
                          reference: cart.id,
                        },
                      },
                    },
                  })
                );
            })
          );

          // B Create the order + items
          const totalCents = picked.reduce(
            (sum, { price }) => sum + Math.round(price * 100),
            0
          );
          const newOrder = await tx.order.create({
            data: {
              userId:     user.id,
              totalCents,
              items: {
                create: picked.map(({ id: itemId, description, src, price }) => ({
                  itemId,
                  quantity:   1,
                  priceCents: Math.round(price * 100),
                  description,
                  src,
                })),
              },
            },
          });

          // C Sell or release/out‐of‐stock
          await Promise.all(
            picked.map(async ({ id: itemId }) => {
              const inv = await tx.inventory.findUnique({
                where:  { itemId },
                select: { id: true, onHand: true, reserved: true },
              });
              if (!inv) return;

              if (inv.onHand > 0) {
                // SALE
                const sellQty = Math.min(inv.onHand, 1);
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    onHand:   { decrement: sellQty },
                    reserved: { decrement: sellQty },
                    transactions: {
                      create: {
                        change:    -sellQty,
                        type:      "SALE",
                        reference: newOrder.id,
                      },
                    },
                  },
                });
              } else {
                // RELEASE + OUT_OF_STOCK
                const releaseQty = Math.min(inv.reserved, 1);
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    reserved: { decrement: releaseQty },
                    transactions: {
                      create: [
                        {
                          change:    -releaseQty,
                          type:      "RELEASE",
                          reference: newOrder.id,
                        },
                        {
                          change:     0,
                          type:       "OUT_OF_STOCK",
                          reference:  newOrder.id,
                        },
                      ],
                    },
                  },
                });
              }
            })
          );

          // D Clear the cart
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }, "writing-order" );

        sessionOrders++;
        // trigger restock in session 0
        if (idx === 0 && sessionOrders % perSessionRestock === 0) {
          console.log(
            `[session 0] sessionOrders=${sessionOrders} → triggering restock`
          );
          await restockIfNeeded();
        }

        // throttle
        await new Promise((r) => setTimeout(r, 1000));
      }

      // 4c) Write summary
      await runWithRetry((tx) =>
        tx.loadRunSummary.create({
          data: {
            runId:           run.id,
            username,
            ordersCompleted: sessionOrders,
            startTime:       sessionStart,
            endTime:         new Date(),
          },
        })
      );
    })
  );

  // --- 5) Finalize run ---
  await runWithRetry((tx) =>
    tx.loadRun.update({
      where: { id: run.id },
      data: { endTime: new Date() },
    })
  );

  return res.status(200).json({ runId: run.id });
}
