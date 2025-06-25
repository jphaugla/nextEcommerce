// pages/api/generate-load.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
import { randomInt } from "crypto";

type SummaryRow = {
  username: string;
  ordersCompleted: number;
  startTime: string;
  endTime: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ runId: string } | { error: string }>
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

  // 0) preload catalog
  const allItems = await prisma.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true },
  });

  // 1) create LoadRun
  const run = await runWithRetry((tx) =>
    tx.loadRun.create({
      data: { userEmail: initiator, numSessions, numOrders },
    }),
    "load-run-init"
  );

  // helper to restock
  async function restockIfNeeded() {
    const invs = await prisma.inventory.findMany({
      select: { id: true, itemId: true, onHand: true, threshold: true, restockAmount: true },
    });
    const low = invs.filter((i) => i.onHand < i.threshold);
    if (!low.length) return;
    await runWithRetry((tx) =>
      Promise.all(
        low.map((inv) =>
          tx.inventory.update({
            where: { id: inv.id },
            data: {
              onHand: { increment: inv.restockAmount },
              transactions: {
                create: {
                  change: inv.restockAmount,
                  type: "RESTOCK",
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

  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));

  // 2) spawn sessions
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const username =
        idx === 0
          ? initiator
          : `${String(randomInt(0, 2000)).padStart(4, "0")}@cockroachlabs.com`;

      // upsert user & cart
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
      const sessionStart = new Date().toISOString();

      for (let orderIndex = 0; orderIndex < numOrders; orderIndex++) {
        // pick some items
        const count = randomInt(1, 9);
        const picked = allItems
          .map((it) => ({ ...it, rnd: Math.random() }))
          .sort((a, b) => a.rnd - b.rnd)
          .slice(0, count);

        // A) reserve into cart & inventory
        await runWithRetry(async (tx) => {
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
                          change: qty,
                          type: "RESERVE",
                          reference: cart.id,
                        },
                      },
                    },
                  })
                );
            })
          );
        }, "reserve-cart");

        // B) create order + items
        const totalCents = picked.reduce(
          (sum, { price }) => sum + Math.round(price * 100),
          0
        );
        const newOrder = await runWithRetry((tx) =>
          tx.order.create({
            data: {
              userId: user.id,
              totalCents,
              items: {
                create: picked.map(({ id: itemId, description, src, price }) => ({
                  itemId,
                  quantity: 1,
                  priceCents: Math.round(price * 100),
                  description,
                  src,
                })),
              },
            },
          }),
          "create-order"
        );

        // C+D) adjust inventory and clear cart
        await runWithRetry(async (tx) => {
          // adjust each SKU
          await Promise.all(
            picked.map(async ({ id: itemId }) => {
              const inv = await tx.inventory.findUnique({
                where: { itemId },
                select: { id: true, onHand: true, reserved: true },
              });
              if (!inv) return;
              if (inv.onHand > 0) {
                const sellQty = Math.min(inv.onHand, 1);
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    onHand: { decrement: sellQty },
                    reserved: { decrement: sellQty },
                    transactions: {
                      create: {
                        change: -sellQty,
                        type: "SALE",
                        reference: newOrder.id,
                      },
                    },
                  },
                });
              } else {
                const releaseQty = Math.min(inv.reserved, 1);
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    reserved: { decrement: releaseQty },
                    transactions: {
                      create: [
                        {
                          change: -releaseQty,
                          type: "RELEASE",
                          reference: newOrder.id,
                        },
                        {
                          change: 0,
                          type: "OUT_OF_STOCK",
                          reference: newOrder.id,
                        },
                      ],
                    },
                  },
                });
              }
            })
          );

          // clear the cart
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }, "adjust-and-clear");

        sessionOrders++;
        if (idx === 0 && sessionOrders % perSessionRestock === 0) {
          await restockIfNeeded();
        }

        // throttle
        await new Promise((r) => setTimeout(r, 1000));
      }

      // summary row
      await runWithRetry((tx) =>
        tx.loadRunSummary.create({
          data: {
            runId: run.id,
            username,
            ordersCompleted: sessionOrders,
            startTime: sessionStart,
            endTime: new Date().toISOString(),
          },
        }),
        "write-summary"
      );
    })
  );

  // 3) finalize run
  await runWithRetry((tx) =>
    tx.loadRun.update({
      where: { id: run.id },
      data: { endTime: new Date().toISOString() },
    }),
    "finalize-run"
  );

  res.status(200).json({ runId: run.id });
}
