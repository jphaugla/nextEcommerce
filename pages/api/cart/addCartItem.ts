// pages/api/cart/addCartItem.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/services/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const { cartId, itemId, quantity } = req.body as {
    cartId: string;
    itemId: string;
    quantity: number;
  };
  if (!cartId || !itemId || !quantity) return res.status(400).json({ error: "Missing data" });

  try {
    // Tx: upsert cartItem + adjust inventory reserved + log transaction
    const [cartItem, inventory] = await prisma.$transaction([
      // 1) add or increment the cart item
      prisma.cartItem.upsert({
        where: { cartId_itemId: { cartId, itemId } },
        update: { quantity: { increment: quantity } },
        create: { cartId, itemId, quantity },
      }),
      // 2) increment reserved stock
      prisma.inventory.update({
        where: { itemId },
        data: {
          reserved: { increment: quantity },
          transactions: {
            create: {
              change: quantity,
              type: "RESERVE",
              reference: cartId,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({ cartItem });
  } catch (err: any) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ error: err.message });
  }
}
