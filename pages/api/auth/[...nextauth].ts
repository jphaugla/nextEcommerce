// pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../services/prisma-client";

// Debouncing logging errors for callbacks to Google OAuth (optional)
const token = process.env.LOGGING;
const method = "sendMessage";
const url = `https://api.telegram.org/bot${token}/${method}`;
let timeoutId: NodeJS.Timeout | null = null;

async function handler(data: any) {
  try {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const telRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || { test: "test" }),
      });
      const telData = await telRes.json();
      console.log("telData", telData);
      timeoutId = null;
    }, 1500);
  } catch (error: any) {
    console.error("Error sending message:", error);
  }
}

async function debouncedApiCall(callbackParams: any) {
  try {
    const data = {
      chat_id: process.env.TELEGRAM_ID,
      text: JSON.stringify({ callbackParams }),
    };
    handler(data);
  } catch (error) {
    console.error("Error performing API call:", error);
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.JWT_SECRET,

  callbacks: {
    // 1) Copy user.id into session.user.id
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    // 2) Your existing redirect callback
    async redirect(callbackParams) {
      console.log("Redirect callbackParams:", callbackParams);
      debouncedApiCall(callbackParams);
      return callbackParams.baseUrl;
    },
  },

  events: {
    // Create a cart when a new user signs up
    createUser: async ({ user }) => {
      const generatedCartId = uuidv4();
      await prisma.cart.create({
        data: {
          id: generatedCartId,
          userId: user.id,
        },
      });
    },
  },
};

export default NextAuth(authOptions);
