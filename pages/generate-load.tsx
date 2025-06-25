// pages/api/generate-load.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
import { randomInt } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // … validation & preload allItems & loadRun same as before …

  // Launch sessions in parallel
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      // … upsert user & cart …

      for (let orderIndex = 0; orderIndex < numOrders; orderIndex++) {
        const picked = /* your random pick logic */ [];

        // 1) Reserve stock & add to cart
        await runWithRetry(
          (tx) =>
            Promise.all(
              picked.map(({ id: itemId, stock }) => {
                const qty = stock > 1 ? randomInt(1, 4) : 1;
                return tx.cartItem.upsert({
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
            ),
          "reserve-cart",
          { timeoutMs: 10_000 }
        );

        // 2) Create order + items
        const newOrder = await runWithRetry(
          (tx) => {
            const totalCents = picked.reduce(...);
            return tx.order.create({
              data: {
                userId: user.id,
                totalCents,
                items: {
                  create: picked.map(({ id, description, src, price }) => ({
                    itemId: id,
                    quantity: 1,
                    priceCents: Math.round(price * 100),
                    description,
                    src,
                  })),
                },
              },
            });
          },
          "create-order",
          { timeoutMs: 10_000 }
        );

        // 3) Adjust onHand/reserved *and* clear cart
        //    (we actually split: first adjust inventory, *then* clear cart)
        await runWithRetry(
          async (tx) => {
            await Promise.all(
              picked.map(async ({ id: itemId }) => {
                const inv = await tx.inventory.findUnique({ where: { itemId } });
                if (!inv) return;

                if (inv.onHand > 0) {
                  const sellQty = Math.min(inv.onHand, 1);
                  await tx.inventory.update({ /* decrement onHand & reserved */ });
                } else {
                  await tx.inventory.update({ /* release & out-of-stock logs */ });
                }
              })
            );
          },
          "settle-inventory",
          { timeoutMs: 20_000 }
        );

        await runWithRetry(
          (tx) => tx.cartItem.deleteMany({ where: { cartId: cart.id } }),
          "clear-cart",
          { timeoutMs: 5_000 }
        );

        // optional restock trigger…
      }
    })
  );

  // … finalize LoadRun & return …
}
