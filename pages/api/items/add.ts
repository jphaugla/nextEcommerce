// pages/api/items/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ item?: any; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const data = req.body;
    const item = await prisma.item.create({ data });
    return res.status(201).json({ item });
  } catch (err: any) {
    console.error("add item error:", err);
    res.status(500).json({ error: err.message });
  }
}

