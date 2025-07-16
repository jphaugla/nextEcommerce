// pages/api/cart/incrementCartItem.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartItemId } = req.body as { cartItemId?: string };
  if (!cartItemId) {
    return res.status(400).json({ error: "Missing cartItemId" });
  }

  try {
    await runWithRetry(
      () => prisma.$transaction(async (tx) => {
        // 1) Fetch the existing cartReservation (or cartItem)
        const reservation = await tx.cartReservation.findUnique({
          where: { id: cartItemId },
        });
        if (!reservation) {
          throw new Error("Reservation not found");
        }
        const { cartId, itemId } = reservation;

        // 2) Upsert the Quantity
        await tx.cartReservation.update({
          where: { id: cartItemId },
          data: { quantity: { increment: 1 } },
        });

        // 3) Adjust inventory
        await tx.inventory.update({
          where: { itemId },
          data: {
            onHand:   { decrement: 1 },
            reserved: { increment: 1 },
            transactions: {
              create: {
                change:    1,
                type:      "RESERVE",
                reference: cartId,
              },
            },
          },
        });
      }),
      "increment-cart-item",
      5,
      null,
      null
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("incrementCartItem error:", err);
    return res.status(500).json({ error: err.message });
  }
}
