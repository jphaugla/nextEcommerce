import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../../../services/prisma-client"



export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async redirect(params) {
      console.log("Redirect url:", params.baseUrl)
      console.log("env redirect:", process.env.BASE_REDIRECT_URL)
      params.baseUrl = process.env.BASE_REDIRECT_URL!
      return params.baseUrl;
    },
  },
  events: {
    createUser: async (message) => {
      const generatedCartId = uuidv4()
      // const updatedUser = await prisma.user.update({
      //   where: {
      //     id: message.user.id
      //   },
      //   data: {
      //     cartId: generatedCartId
      //   }
      // })
      const userCart = await prisma.cart.create({
        data: {
          id: generatedCartId,
          userId: message.user.id
        },
      })
    }
  }
};
export default NextAuth(authOptions);
