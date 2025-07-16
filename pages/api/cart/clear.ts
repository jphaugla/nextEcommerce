// pages/api/cart/clear.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success?: boolean; error?: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    return res.status(400).json({ error: "Missing cartId" });
  }

  try {
    await runWithRetry(
      () => prisma.$transaction(async (tx) => {
        // 1) Fetch all reservations for this cart
        const reservations = await tx.cartReservation.findMany({
          where: { cartId },
        });

        // 2) For each, restore inventory.onHand & decrement reserved
        for (const r of reservations) {
          await tx.inventory.update({
            where: { itemId: r.itemId },
            data: {
              reserved: { decrement: r.quantity },
              onHand:   { increment: r.quantity },
              transactions: {
                create: {
                  change:    r.quantity,
                  type:      "CANCEL",
                  reference: cartId,
                },
              },
            },
          });
        }

        // 3) Delete cart items & reservations
        await tx.cartItem.deleteMany({ where: { cartId } });
        await tx.cartReservation.deleteMany({ where: { cartId } });
      }),
      "clear-cart",
      5,
      null,
      null
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("clear-cart error:", err);
    return res.status(500).json({ error: err.message });
  }
}

