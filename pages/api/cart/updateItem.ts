// pages/api/cart/updateItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ item?: any; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();

  const { cartItemId, quantity } = req.body as { cartItemId: string; quantity: number };
  if (!cartItemId || quantity == null) {
    return res.status(400).json({ error: "Missing cartItemId or quantity" });
  }

  try {
    const updated = await runWithRetry(
      () => prisma.$transaction(async (tx) => {
        // 1) Load the previous reservation
        const prev = await tx.cartItem.findUnique({ where: { id: cartItemId } });
        if (!prev) throw new Error("CartItem not found");
        const delta = quantity - prev.quantity;

        // 2) Update CartItem
        const item = await tx.cartItem.update({
          where: { id: cartItemId },
          data: { quantity },
        });

        // 3) Adjust inventory & reservation
        if (delta > 0) {
          // reserve extra
          await tx.inventory.update({
            where: { itemId: prev.itemId },
            data: {
              onHand:   { decrement: delta },
              reserved: { increment: delta },
              transactions: {
                create: {
                  change:    delta,
                  type:      "RESERVE",
                  reference: prev.cartId,
                },
              },
            },
          });
          await tx.cartReservation.updateMany({
            where: { cartId: prev.cartId, itemId: prev.itemId },
            data: { quantity: { increment: delta } },
          });
        } else if (delta < 0) {
          // release some
          const rel = -delta;
          await tx.inventory.update({
            where: { itemId: prev.itemId },
            data: {
              reserved: { decrement: rel },
              onHand:   { increment: rel },
              transactions: {
                create: {
                  change:    -rel,
                  type:      "RELEASE",
                  reference: prev.cartId,
                },
              },
            },
          });
          await tx.cartReservation.updateMany({
            where: { cartId: prev.cartId, itemId: prev.itemId },
            data: { quantity: { decrement: rel } },
          });
        }

        return item;
      }),
      "update-cart-item", 5, null, null
    );

    return res.status(200).json({ item: updated });
  } catch (err: any) {
    console.error("updateCartItem error:", err);
    return res.status(500).json({ error: err.message });
  }
}
