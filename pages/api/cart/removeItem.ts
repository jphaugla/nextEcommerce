// pages/api/cart/removeItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; error?: string }>
) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { cartItemId } = req.body;
  try {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("removeCartItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

