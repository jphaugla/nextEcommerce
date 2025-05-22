// pages/api/cart/cancel.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartId } = req.body;
  try {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancel cart error:", err);
    res.status(500).json({ error: err.message });
  }
}

