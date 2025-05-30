import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; item?: any; error?: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cartItemId } = req.body as { cartItemId: string };
  if (!cartItemId) {
    return res.status(400).json({ error: "Missing cartItemId" });
  }

  try {
    const item = await runWithRetry(tx => 
      tx.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: { increment: 1 } },
    }),
    );
    return res.status(200).json({ success: true, item });
  } catch (err: any) {
    console.error("incrementCartItem error:", err);
    return res.status(500).json({ error: "Failed to increment" });
  }
}
