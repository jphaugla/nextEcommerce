// pages/api/order/place.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/services/prisma-client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Authenticate via NextAuth in an API route
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 2) Lookup the corresponding Prisma User
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return res.status(400).json({ error: "User record not found" });
  }

  // 3) Validate body
  const { cartId } = req.body;
  if (!cartId || typeof cartId !== "string") {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    // 4) Fetch cart items with related product data
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { item: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 5) Compute total cents
    const totalCents = cartItems.reduce(
      (sum, ci) => sum + ci.quantity * Math.round(ci.item.price * 100),
      0
    );

    // 6) Create Order + OrderItems in a transaction, then clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalCents,
          items: {
            create: cartItems.map((ci) => ({
              itemId: ci.itemId,
              quantity: ci.quantity,
              priceCents: Math.round(ci.item.price * 100),
              description: ci.item.description,
              src: ci.item.src,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId } });
      return newOrder;
    });

    return res.status(201).json({ order });
  } catch (err: any) {
    console.error("Place order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
