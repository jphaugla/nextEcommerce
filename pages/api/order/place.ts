// pages/api/order/place.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type OrderItemData = {
  itemId: string;
  quantity: number;
  priceCents: number;
  description: string;
  src: string;
};

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
  if (!session?.user?.email || !session.user.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    // 2) Fetch cart items & their inventory reservations
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: { item: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const reservations = await prisma.cartReservation.findMany({
      where: { cartId },
    });
    const reservationMap = new Map<string, number>();
    for (const r of reservations) {
      reservationMap.set(r.itemId, (reservationMap.get(r.itemId) || 0) + r.quantity);
    }

    // 3) Compute total
    const totalCents = cartItems.reduce(
      (sum, ci) => sum + Math.round(ci.item.price * 100) * ci.quantity,
      0
    );

    // 4) Run everything in one serializable transaction
    const newOrder = await runWithRetry(
      async (tx) => {
        // 4a) Create the order + line items
        const order = await tx.order.create({
          data: {
            userId: session.user.id,
            totalCents,
            status: "PENDING",
            items: {
              create: cartItems.map<OrderItemData>((ci) => ({
                itemId:      ci.itemId,
                quantity:    ci.quantity,
                priceCents:  Math.round(ci.item.price * 100),
                description: ci.item.name,
                src:         ci.item.src,
              })),
            },
          },
        });

        // 4b) Adjust inventory for each line
        for (const ci of cartItems) {
          const inv = await tx.inventory.findUnique({
            where: { itemId: ci.itemId },
          });
          if (!inv) {
            throw new Error(`Inventory record missing for item ${ci.itemId}`);
          }

          const reservedQty = reservationMap.get(ci.itemId) || 0;
          const sellQty     = Math.min(inv.onHand, ci.quantity);
          const toRelease   = Math.min(reservedQty, ci.quantity);

          // i) Sell up to available onHand
          if (sellQty > 0) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                onHand:   { decrement: sellQty },
                reserved: { decrement: toRelease },
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

          // ii) Release any leftover reservation beyond what we sold
          const leftoverRes = ci.quantity - sellQty;
          if (leftoverRes > 0 && toRelease > sellQty) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                reserved: { decrement: toRelease - sellQty },
                transactions: {
                  create: {
                    change:    -(toRelease - sellQty),
                    type:      "RELEASE",
                    reference: cartId,
                  },
                },
              },
            });
          }

          // iii) If still short, log out-of-stock
          if (ci.quantity > sellQty) {
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

        // 4c) Clear the cart (items + reservations)
        await tx.cartItem.deleteMany({ where: { cartId } });
        await tx.cartReservation.deleteMany({ where: { cartId } });

        return order;
      },
      /* taskName */ "place-order",
      /* retries  */ 5,
      /* sessionId*/ null,
      /* onFail   */ null
    );

    return res.status(201).json({ order: newOrder });
  } catch (err: any) {
    console.error("Place order error:", err);
    return res.status(500).json({ error: err.message });
  }
}

