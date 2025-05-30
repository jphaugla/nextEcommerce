// pages/api/items/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ item?: any; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const data = req.body;
    const item = await runWithQuery(tx =>
      tx.item.create({ data });
    return res.status(201).json({ item });
  } catch (err: any) {
    console.error("add item error:", err);
    res.status(500).json({ error: err.message });
  }
}

