import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../../../services/prisma-client"


//Debouncing Logging errors for callbacks to GoogleOAuth for debugging
const token = process.env.LOGGING
const method = 'sendMessage'
const url = `https://api.telegram.org/bot${token}/${method}`
let timeoutId: NodeJS.Timeout | null = null;

async function handler(data:any) {
  try {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(async () => {
      const telRes = await fetch(url, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data || {test:"test"})
      });
      const telData = await telRes.json();
      console.log("telData", telData);
      timeoutId = null; // Clear the timeout ID after execution
    }, 1500); // Adjust the debounce duration as needed (e.g., 500 milliseconds)
  } catch (error:any) {
    console.error("Error sending message:", error);
  }
}

async function debouncedApiCall(callbackParams: any) {
  try {
    const data = {
      chat_id: process.env.TELEGRAM_ID,
      text: JSON.stringify({ callbackParams })
    }
    handler(data)
  } catch (error) {
    console.error("Error performing API call:", error);
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma),
  // callbacks: {
  //   async redirect(params) {
  //     console.log("Redirect url:", params.baseUrl)
  //     console.log("env redirect:", process.env.BASE_REDIRECT_URL)
  //     params.baseUrl = process.env.BASE_REDIRECT_URL!
  //     return params.baseUrl;
  //   },
  // },
  callbacks:{
    async redirect(callbackParams) {

      console.log("Redirect callbackParams:", callbackParams);
      debouncedApiCall(callbackParams)

      // Handle errors related to the redirect
      // if (callbackParams?.error) {
      //   console.error("Redirect error:", callbackParams.error);
      //   // You can choose to redirect the user to an error page or handle it accordingly
      //   throw new Error("Redirect error occurred");
      // }

      // Return the base URL
      return callbackParams.baseUrl;
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
