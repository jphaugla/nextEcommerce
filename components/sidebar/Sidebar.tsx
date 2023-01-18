import React from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

interface Props {
  handleShowSideMenu: () => void;
  session: Session | null;
}

const SidebarSignIn = () => {
  return (
    <div className="grid sm:hidden place-items-center rounded-md">
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

const Sidebar: React.FC<Props> = ({ handleShowSideMenu, session }) => {
  return (
    <div className="absolute h-[100vh] w-[240px]  bg-slate-200 z-50 right-0 block sm:hidden ">
      <div className="bg-slate-300 flex py-4 pr-1 justify-end">
        <button
          type="button"
          className="p-2 rounded-md inline-flex items-center justify-center text-gray-400"
          onClick={handleShowSideMenu}
        >
          <span className="sr-only">Close menu</span>
          <svg
            className="h-10 w-12"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {session ? (
        <div className="text-center border-2 border-red-200">
          <Link
            href="/api/auth/signout"
            className="rounded-md p-2"
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
      ) : (
        <SidebarSignIn />
      )}

      <div className="grid place-items-center">
        <div className="text-center w-[40%] text-blue-400 rounded-lg hover:text-blue-300 font-extrabold cursor-pointer hover:ring-4">
          Home
        </div>
      </div>

      <div>About</div>
      <div>Contact</div>
      {session && <div>Profile</div>}
      {session && <div>Cart</div>}
    </div>
  );
};

export default Sidebar;
