// pages/api/cart/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, runWithRetry } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { username } = req.body as { username?: string };
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  // 1) Find the User by email
  const user = await prisma.user.findUnique({ where: { email: username } });
  if (!user) {
    return res.status(404).json({ error: `User ${username} not found` });
  }

  // 2) Upsert their Cart
  const cart = await runWithRetry(tx =>
    tx.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });
  );

  return res.status(200).json({ cartId: cart.id });
}
