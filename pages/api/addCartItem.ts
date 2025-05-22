// pages/api/addCartItem.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

type ReqBody = {
  cartId: string;
  itemId: string;
  quantity: number;
};

type ResData =
  | { success: true; item: { id: string; itemId: string; quantity: number } }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  console.log("API /api/addCartItem called, body:", req.body);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cartId, itemId, quantity } = req.body as ReqBody;
  if (!cartId || !itemId || typeof quantity !== "number") {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  try {
    // Upsert a CartItem: if one exists for this cart+item, update quantity; otherwise create
    const item = await prisma.cartItem.upsert({
      where: { cartId_itemId: { cartId, itemId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, itemId, quantity },
    });

    return res.status(200).json({ success: true, item });
  } catch (err: any) {
    console.error("Error in addCartItem:", err);
    return res.status(500).json({ error: "Failed to add item to cart" });
  }
}

