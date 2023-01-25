import NextAuth from "next-auth";
import { v4 as uuidv4 } from 'uuid';
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import clientPromise from "../../../lib/mongodb";

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

import type { AuthOptions } from "next-auth";
const prisma = new PrismaClient()


interface Message {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image: string;
  cartId?: string
}

import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // profile(profile) {
      //   return {
      //     id: profile.sub,
      //     name: profile.name,
      //     email: profile.email,
      //     image: profile.picture,
      //   }
      // },
    }),
  ],

  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma),
  events: {
    createUser: async (message: any) => {

      const generatedCartId = uuidv4()
      const updatedUser = await prisma.user.update({
        where: {
          id: message.user.id
        },
        data: {
          cartId: generatedCartId
        }
      })
      const userCart = await prisma.cart.create({
        data: {
          id: generatedCartId,
          userId: updatedUser.id,
        },
      })
      console.log('updated User: ', updatedUser)
      console.log('user Cart: ', userCart)
    }









  }
  // callbacks: {
  //   async jwt(token, account) {
  //     if (account?.accessToken) {
  //       token.accessToken = account.accessToken;
  //     }
  //     return token;
  //   },
  //   redirect: async (url, _baseUrl) => {
  //     if (url === "/user") {
  //       return Promise.resolve("/");
  //     }
  //     return Promise.resolve("/");
  //   },
  // },

};
export default NextAuth(authOptions);
