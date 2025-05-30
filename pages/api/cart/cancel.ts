// pages/api/cart/cancel.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartId } = req.body;
  try {
    await runWithRetry(tx => 
    tx.cartItem.deleteMany({ where: { cartId } });
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancel cart error:", err);
    res.status(500).json({ error: err.message });
  }
}

