// pages/api/cart/removeCartItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const { cartId, itemId, quantity } = req.body as { cartId: string; itemId: string; quantity: number };
  if (!cartId || !itemId || quantity == null) {
    return res.status(400).json({ error: "Missing cartId, itemId or quantity" });
  }

  try {
    await runWithRetry(
      () => prisma.$transaction([
        // 1) Decrement the CartItem
        prisma.cartItem.update({
          where: { cartId_itemId: { cartId, itemId } },
          data: { quantity: { decrement: quantity } },
        }),
        // 2) Adjust inventory reserved → onHand + log
        prisma.inventory.update({
          where: { itemId },
          data: {
            reserved: { decrement: quantity },
            onHand:   { increment: quantity },
            transactions: {
              create: {
                change:    -quantity,
                type:      "RELEASE",
                reference: cartId,
              },
            },
          },
        }),
        // 3) Decrement the reservation
        prisma.cartReservation.updateMany({
          where: { cartId, itemId },
          data: { quantity: { decrement: quantity } },
        }),
      ]),
      "remove-cart-item", 5, null, null
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ error: err.message });
  }
}

