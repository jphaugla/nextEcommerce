// pages/api/cart/cancel.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartId } = req.body;
  if (!cartId) return res.status(400).json({ error: "Missing cartId" });

  try {
    await runWithRetry(
      () => prisma.$transaction(async (tx) => {
        // 1) Fetch all reservations for this cart
        const reservations = await tx.cart_reservation.findMany({
          where: { cartId },
        });

        // 2) Undo each reservation
        await Promise.all(reservations.map(r =>
          tx.inventory.update({
            where: { itemId: r.itemId },
            data: {
              reserved: { decrement: r.quantity },
              onHand:   { increment: r.quantity },
            },
          })
        ));

        // 3) Clean up cart items, reservations, and (optionally) the cart itself
        await tx.cartItem.deleteMany({ where: { cartId } });
        await tx.cart_reservation.deleteMany({ where: { cartId } });
        // (if you want to drop the cart record itself: await tx.cart.delete({ where:{id:cartId} }); )

      }),
      "cancel-cart", 5, null, null
    );

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancel cart error:", err);
    res.status(500).json({ error: err.message });
  }
}
