// pages/api/cart/cancel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { cartId } = req.body as { cartId: string };
  if (!cartId) return res.status(400).json({ error: "Missing cartId" });

  try {
    await runWithRetry(
      () => prisma.$transaction(async (tx) => {
        // 1) Fetch all reservations
        const reservations = await tx.cartReservation.findMany({ where: { cartId } });

        // 2) Restore inventory for each
        for (const r of reservations) {
          await tx.inventory.update({
            where: { itemId: r.itemId },
            data: {
              reserved: { decrement: r.quantity },
              onHand:   { increment: r.quantity },
            },
          });
        }

        // 3) Delete all CartItems + CartReservations
        await tx.cartItem.deleteMany({ where: { cartId } });
        await tx.cartReservation.deleteMany({ where: { cartId } });
      }),
      "cancel-cart", 5, null, null
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancel cart error:", err);
    return res.status(500).json({ error: err.message });
  }
}

