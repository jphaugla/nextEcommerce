import React from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import CartIcon from "./CartIcon";
import { Cart, CartItem } from "@/types/cartItems";
interface Props {
  session: Session | null;
  cartItems: CartItem[] | null;
}

const SignInDiv = () => {
  return (
    <div className="hidden sm:grid place-items-center rounded-md">
      <Link
        href="/api/auth/signin"
        onClick={(e) => {
          e.preventDefault();
          signIn("google");
        }}
      >
        <div className=" flex text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-3 xs:px-5 py-2.5 text-center  items-center dark:focus:ring-[#4285F4]/55 ">
          <svg
            className="w-4 h-4 mr-2 -ml-1"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          <span className="hidden xs:inline-block">{`Sign in with Google`}</span>
          <span className="inline-block xs:hidden">{`Sign in`}</span>
        </div>
      </Link>
    </div>
  );
};

const SignOutDiv = ({ numItems }: { numItems: number }) => {
  return (
    <>
      <div className="hidden sm:flex justify-center align-middle gap-5 p-2 rounded-md">
        <CartIcon numItems={numItems} />
        <Link
          href="/api/auth/signout"
          className="hover:ring-4 rounded-md p-2"
          onClick={(e) => {
            e.preventDefault();
            signOut({
              callbackUrl: `http://localhost:3000/`,
            });
          }}
        >
          Sign Out
        </Link>
      </div>
    </>
  );
};

const AuthLinks: React.FC<Props> = ({ session, cartItems }) => {
  const numItems = cartItems
    ? cartItems.reduce((acc, cartItem: CartItem) => {
        return acc + Number(cartItem.quantity);
      }, 0)
    : 0;
  return <>{session ? <SignOutDiv numItems={numItems} /> : <SignInDiv />}</>;
};

export default AuthLinks;
