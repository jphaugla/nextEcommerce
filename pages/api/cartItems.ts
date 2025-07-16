// pages/api/cart/cartItems.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

interface CartItem {
  id: string;       // reservation row ID
  itemId: string;
  quantity: number;
}

type ResData = { items: CartItem[] } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  // Only GET or implicit read via query
  const { cartId } = req.query;
  if (!cartId || Array.isArray(cartId)) {
    return res.status(400).json({ error: "Missing or invalid cartId" });
  }

  try {
    // Pull each reservation row for this cart
    const items = await prisma.cartReservation.findMany({
      where: { cartId: cartId as string },
      select: {
        id:       true,
        itemId:   true,
        quantity: true,
      },
    });

    return res.status(200).json({ items });
  } catch (err: any) {
    console.error("Error fetching cart items:", err);
    return res.status(500).json({ error: "Could not fetch cart items" });
  }
}

