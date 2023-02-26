import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "../../services/prisma-client"

type ResData = {
  cartId?: string
  error?: string
}
interface ReqBodyType {
  email: string;
}
type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type MyCustomRequest = Override<NextApiRequest, { body: ReqBodyType }>

export default async function handler(
  req: MyCustomRequest,
  res: NextApiResponse<ResData>
) {
  const { email } = req.body
  let user = await prisma.user.findUnique({
    where: {
      email: email!,
    },
  });
  if (!user) {
    res.status(400).json({ error: 'No user found with session email' })
  } else {
    let cartId = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });
    res.status(200).json({ cartId: cartId?.id ? cartId.id : null })
  }
}
