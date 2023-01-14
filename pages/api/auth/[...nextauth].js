import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import GithubProvider from "next-auth/providers/github";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_ID,
      clientSecret: process.env.AUTH_SECRET,
    }),
  ],
  // adapter: MongoDBAdapter(clientPromise),
};
export default NextAuth(authOptions);
