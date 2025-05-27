// pages/api/order/place.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Authenticate
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    // 2) Lookup cart and its items
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { item: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 3) Compute total
    const totalCents = cartItems.reduce(
      (sum, ci) => sum + ci.quantity * Math.round(ci.item.price * 100),
      0
    );

    // 4) Transaction: create order, adjust inventory, clear cart
    const order = await prisma.$transaction(async (tx) => {
      // 4a) Create the order + items
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalCents,
          items: {
            create: cartItems.map((ci) => ({
              itemId:      ci.itemId,
              quantity:    ci.quantity,
              priceCents:  Math.round(ci.item.price * 100),
              description: ci.item.description,
              src:         ci.item.src,
            })),
          },
        },
      });

      // 4b) For each cart item, adjust inventory safely
      await Promise.all(
        cartItems.map(async (ci) => {
          // fetch current onHand & reserved
          const inv = await tx.inventory.findUnique({
            where: { itemId: ci.itemId },
            select: { id: true, onHand: true, reserved: true },
          });
          if (!inv) {
            throw new Error(`Inventory record not found for item ${ci.itemId}`);
          }

          // how much we can actually sell
          const sellQty = Math.min(inv.onHand, ci.quantity);

          // how much we can release from reserved
          const releaseQty = Math.min(inv.reserved, ci.quantity);

          //  i) if we sold some, decrement onHand & reserved and log SALE
          if (sellQty > 0) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                onHand:   { decrement: sellQty },
                reserved: { decrement: releaseQty },
                transactions: {
                  create: {
                    change:    -sellQty,
                    type:      "SALE",
                    reference: newOrder.id,
                  },
                },
              },
            });
          }

          // ii) if we couldn’t sell the full requested ci.quantity, release any leftover reservation
          const leftover = ci.quantity - sellQty;
          if (leftover > 0) {
            // release any reserved above what we sold
            if (releaseQty > sellQty) {
              await tx.inventory.update({
                where: { id: inv.id },
                data: {
                  reserved: { decrement: releaseQty - sellQty },
                  transactions: {
                    create: {
                      change:    -(releaseQty - sellQty),
                      type:      "RELEASE",
                      reference: ci.cartId,
                    },
                  },
                },
              });
            }
            // log OUT_OF_STOCK
            await tx.inventoryTransaction.create({
              data: {
                inventoryId: inv.id,
                change:      0,
                type:        "OUT_OF_STOCK",
                reference:   newOrder.id,
              },
            });
          }
        })
      );

      // 4c) Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return newOrder;
    });

    return res.status(201).json({ order });
  } catch (err: any) {
    console.error("Place order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
