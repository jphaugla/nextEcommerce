// pages/api/cart/removeItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; error?: string }>
) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { cartItemId } = req.body;
  try {
    await runWithRetry(tx=>
    tx.cartItem.delete({ where: { id: cartItemId } });
    );
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("removeCartItem error:", err);
    res.status(500).json({ error: err.message });
  }
}

