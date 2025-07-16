// pages/api/cart/removeItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; error?: string }>
) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { cartItemId, cartId, itemId, quantity } = req.body as {
    cartItemId: string;
    cartId: string;
    itemId: string;
    quantity: number;
  };
  if (!cartItemId || !cartId || !itemId || quantity == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await runWithRetry(
      () => prisma.$transaction([
        // 1) Delete the cartItem
        prisma.cartItem.delete({ where: { id: cartItemId } }),
        // 2) Restore inventory
        prisma.inventory.update({
          where: { itemId },
          data: {
            reserved: { decrement: quantity },
            onHand:   { increment: quantity },
          },
        }),
        // 3) Remove reservation row(s)
        prisma.cartReservation.deleteMany({
          where: { cartId, itemId },
        }),
      ]),
      "delete-cart-item", 5, null, null
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("deleteCartItem error:", err);
    return res.status(500).json({ error: err.message });
  }
}
