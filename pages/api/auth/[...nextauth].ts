import NextAuth from "next-auth";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import clientPromise from "../../../lib/mongodb";

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()


import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],

  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma),


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
