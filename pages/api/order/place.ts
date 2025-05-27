// pages/api/order/place.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/services/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Authenticate the user
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 2) Lookup Prisma User record
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  // 3) Validate request body
  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    // 4) Fetch all items in the cart, including product data
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { item: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 5) Compute total price in cents
    const totalCents = cartItems.reduce(
      (sum, ci) => sum + ci.quantity * Math.round(ci.item.price * 100),
      0
    );

    // 6) Perform transaction: create Order, adjust inventory, clear cart
    const order = await prisma.$transaction(async (tx) => {
      // 6a) Create the Order and OrderItems
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

      // 6b) For each cart item, decrement onHand & reserved and log transaction
      await Promise.all(
        cartItems.map((ci) =>
          tx.inventory.update({
            where: {
              // assume unique([itemId, location]) and location is null for global
              itemId: ci.itemId,
            },
            data: {
              onHand:    { decrement: ci.quantity },
              reserved:  { decrement: ci.quantity },
              transactions: {
                create: {
                  change: -ci.quantity,
                  type: "SALE",
                  reference: newOrder.id,
                },
              },
            },
          })
        )
      );

      // 6c) Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return newOrder;
    });

    // 7) Return the newly created order
    return res.status(201).json({ order });
  } catch (err: any) {
    console.error("Place order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
