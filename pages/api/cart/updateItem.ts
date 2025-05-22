// pages/api/cart/updateItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ item?: any; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartItemId, quantity } = req.body;
  try {
    const item = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return res.status(200).json({ item });
  } catch (err: any) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

