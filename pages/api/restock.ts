// pages/api/restock.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

const LOW_STOCK_LIMIT = 10;   // match your seed/defaults
const RESTOCK_AMOUNT  = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // 1) Find all inventories below threshold
    const low = await prisma.inventory.findMany({
      where: { onHand: { lt: LOW_STOCK_LIMIT } },
      select: { id: true },
    });

    // 2) Restock and log transaction
    await Promise.all(
      low.map((inv) =>
        runWithRetry(tx =>
          tx.inventory.update({
          where: { id: inv.id },
          data: {
            onHand: { increment: RESTOCK_AMOUNT },
            transactions: {
              create: {
                change:    RESTOCK_AMOUNT,
                type:      "RESTOCK",
                reference: "manual-restock",
              },
            },
          },
        }),
        "restock"
      )
      )
    );

    return res
      .status(200)
      .json({ restocked: low.length, message: `${low.length} item(s) restocked` });
  } catch (error: any) {
    console.error("Restock error:", error);
    return res.status(500).json({ error: error.message });
  }
}
