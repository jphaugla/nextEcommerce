// pages/api/generate-load.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";
import { randomInt } from "crypto";
import { retryable } from "@/utils/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    return res.status(400).json({ error: "numSessions and numOrders are required" });
  }

  const initiator = String(req.query.user || "admin@cockroachlabs.com");

  // Preload all items once
  const allItems = await prisma.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true },
  });

  // Create the LoadRun record
  const run = await prisma.loadRun.create({
    data: { userEmail: initiator, numSessions, numOrders },
  });

  // Restock helper
  async function restockIfNeeded() {
    const invs = await prisma.inventory.findMany({
      select: { id: true, itemId: true, onHand: true, threshold: true, restockAmount: true },
    });
    const low = invs.filter((i) => i.onHand < i.threshold);
    if (low.length === 0) {
      console.log("↻ [restock] none below threshold");
      return;
    }
    console.log("↻ [restock] topping up SKUs:", low.map((i) => i.itemId));
    await retryable(() =>
      Promise.all(
        low.map((inv) =>
          prisma.inventory.update({
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
      )
    );
  }

  // Compute per-session restock threshold
  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));
  console.log(`[generate-load] session 0 will restock every ${perSessionRestock} orders`);

  // Launch sessions
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const username =
        idx === 0
          ? initiator
          : `${String(randomInt(0, 2000)).padStart(4, "0")}@cockroachlabs.com`;

      // Upsert user & cart
      const user = await prisma.user.upsert({
        where: { email: username },
        update: {},
        create: { email: username },
      });
      const cart = await prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      let sessionOrders = 0;
      const sessionStart = new Date();

      for (let i = 0; i < numOrders; i++) {
        // Pick 1–8 random items
        const count = randomInt(1, 9);
        const picked = allItems
          .map((it) => ({ ...it, rnd: Math.random() }))
          .sort((a, b) => a.rnd - b.rnd)
          .slice(0, count);

        const cartOps = picked.map((it) => ({
          itemId:     it.id,
          quantity:   it.stock > 1 ? randomInt(1, 4) : 1,
          price:      it.price,
          description: it.description,
          src:         it.src,
        }));

        // Perform reserve → order → sale/stock logic → clear cart
        await retryable(() =>
          prisma.$transaction(async (tx) => {
            // A) Reserve each item
            await Promise.all(
              cartOps.map(({ itemId, quantity }) =>
                tx.cartItem.upsert({
                  where:    { cartId_itemId: { cartId: cart.id, itemId } },
                  update:   { quantity: { increment: quantity } },
                  create:   { cartId: cart.id, itemId, quantity },
                }).then(() =>
                  tx.inventory.update({
                    where: { itemId },
                    data: {
                      reserved: { increment: quantity },
                      transactions: {
                        create: {
                          change:    quantity,
                          type:      "RESERVE",
                          reference: cart.id,
                        },
                      },
                    },
                  })
                )
              )
            );

            // B) Create Order & OrderItems
            const totalCents = cartOps.reduce(
              (sum, { quantity, price }) => sum + quantity * Math.round(price * 100),
              0
            );
            const newOrder = await tx.order.create({
              data: {
                userId:     user.id,
                totalCents,
                items: {
                  create: cartOps.map(({ itemId, quantity, description, src, price }) => ({
                    itemId,
                    quantity,
                    priceCents:  Math.round(price * 100),
                    description,
                    src,
                  })),
                },
              },
            });

            // C) Sell or OUT_OF_STOCK (release + out_of_stock in one update)
            await Promise.all(
              cartOps.map(async ({ itemId, quantity }) => {
                const inv = await tx.inventory.findUnique({
                  where:  { itemId },
                  select: { id: true, onHand: true },
                });
                if (!inv) return;

                if (inv.onHand >= quantity) {
                  // SALE
                  await tx.inventory.update({
                    where: { itemId },
                    data: {
                      onHand:   { decrement: quantity },
                      reserved: { decrement: quantity },
                      transactions: {
                        create: {
                          change:    -quantity,
                          type:      "SALE",
                          reference: newOrder.id,
                        },
                      },
                    },
                  });
                } else {
                  // OUT_OF_STOCK + RELEASE
                  await tx.inventory.update({
                    where: { itemId },
                    data: {
                      reserved: { decrement: quantity },
                      transactions: {
                        create: [
                          {
                            change:    -quantity,
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

            // D) Clear the cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          })
        );

        sessionOrders++;
        if (idx === 0 && sessionOrders % perSessionRestock === 0) {
          console.log(`[session 0] sessionOrders=${sessionOrders} → triggering restock`);
          await restockIfNeeded();
        }

        // Simulate delay
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Write summary
      await prisma.loadRunSummary.create({
        data: {
          runId:           run.id,
          username,
          ordersCompleted: sessionOrders,
          startTime:       sessionStart,
          endTime:         new Date(),
        },
      });
    })
  );

  // Finalize run
  await prisma.loadRun.update({
    where: { id: run.id },
    data: { endTime: new Date() },
  });

  res.status(200).json({ runId: run.id });
}
