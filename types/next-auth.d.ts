import NextAuth, { DefaultSession } from "next-auth"

// interface ExtendedUserData extends DefaultSession["user"] {
//   cartId?: string | null;
// }



declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"] & { cartId?: string | null }
  }
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User { }
  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  interface Account { }
  /** The OAuth profile returned from your provider */
  interface Profile { }
}