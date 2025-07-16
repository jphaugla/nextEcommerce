// pages/api/cart/addCartItem.ts
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
    const [cartItem] = await runWithRetry(
      () => prisma.$transaction([
        // 1) Upsert the cart item
        prisma.cartItem.upsert({
          where: { cartId_itemId: { cartId, itemId } },
          update: { quantity: { increment: quantity } },
          create: { cartId, itemId, quantity },
        }),
        // 2) Adjust inventory onHand & reserved + log
        prisma.inventory.update({
          where: { itemId },
          data: {
            onHand:   { decrement: quantity },
            reserved: { increment: quantity },
            transactions: {
              create: {
                change:    quantity,
                type:      "RESERVE",
                reference: cartId,
              },
            },
          },
        }),
        // 3) Record the reservation
        prisma.cartReservation.create({
          data: { cartId, itemId, quantity },
        }),
      ]),
      "add-cart-item", 5, null, null
    );

    return res.status(200).json({ success: true, item: cartItem });
  } catch (err: any) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ error: err.message });
  }
}
