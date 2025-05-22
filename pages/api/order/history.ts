// pages/api/order/history.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (req.method !== "GET" || !userId) return res.status(405).end();

  try {
    const orders = await prisma.order.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.status(200).json(orders);
  } catch (err: any) {
    console.error("Order history error:", err);
    res.status(500).json({ error: err.message });
  }
}
