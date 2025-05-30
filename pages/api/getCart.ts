// pages/api/getCart.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, runWithRetry } from "@/utils/db";

interface ResData {
  cartId?: string
  error?: string
}

// Extend NextApiRequest to strongly type the request body
export type MyCustomRequest = NextApiRequest & {
  body: { email: string }
}

export default async function handler(
  req: MyCustomRequest,
  res: NextApiResponse<ResData>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(400).json({ error: 'No user found with that email' })
  }

  try {
    // Upsert the cart: create if missing, otherwise return existing
    const cart = await runWithRetry (tx =>
      tx.cart.upsert({
      where: { userId: user.id },
      update: {},                    // no-op update
      create: { userId: user.id }    // create new cart row
    })
  );

    return res.status(200).json({ cartId: cart.id })
  } catch (err) {
    console.error('Error upserting cart:', err)
    return res
      .status(500)
      .json({ error: 'Unable to retrieve or create cart' })
  }
}

