// pages/api/load-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/services/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { runId } = req.query;
  if (!runId) return res.status(400).end("runId required");

  const summaries = await prisma.loadRunSummary.findMany({
    where: { runId: String(runId) },
    orderBy: { username: "asc" },
  });

  res.json(summaries);
}

