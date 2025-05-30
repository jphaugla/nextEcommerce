// pages/api/items/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";
import { prisma } from "@/services/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ item?: any; error?: string }>
) {
  if (req.method !== "PUT") return res.status(405).end();
  try {
    const { id, ...data } = req.body;
    const item = await runWithRetry(tx =>
      tx.item.update({ where: { id }, data });
    return res.status(200).json({ item });
  } catch (err: any) {
    console.error("update item error:", err);
    res.status(500).json({ error: err.message });
  }
}

