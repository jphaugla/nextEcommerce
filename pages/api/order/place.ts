// pages/api/order/place.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
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

  // 1 Authenticate
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    // 2 Lookup cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { item: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 3 Compute total
    const totalCents = cartItems.reduce(
      (sum, ci) => sum + ci.quantity * Math.round(ci.item.price * 100),
      0
    );

    // 4 One Serializable transaction with retry logging
    const newOrder = await runWithRetry(async (tx) => {
      // 4a Create the order + items
      const order = await tx.order.create({
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

      // 4b Adjust inventory per cart item
      for (const ci of cartItems) {
        const inv = await tx.inventory.findUnique({
          where: { itemId: ci.itemId },
          select: { id: true, onHand: true, reserved: true },
        });
        if (!inv) {
          throw new Error(`Inventory not found for item ${ci.itemId}`);
        }

        const sellQty    = Math.min(inv.onHand, ci.quantity);
        const releaseQty = Math.min(inv.reserved, ci.quantity);

        // i Sell what we can
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
                  reference: order.id,
                },
              },
            },
          });
        }

        // ii Release leftover reservation
        const leftover = ci.quantity - sellQty;
        if (leftover > 0 && releaseQty > sellQty) {
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

        // iii Log out‐of‐stock if we couldn’t fulfill completely
        if (leftover > 0) {
          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inv.id,
              change:      0,
              type:        "OUT_OF_STOCK",
              reference:   order.id,
            },
          });
        }
      }

      // 4c Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return order;
    },
    "place-order");

    return res.status(201).json({ order: newOrder });
  } catch (err: any) {
    console.error("Place order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
