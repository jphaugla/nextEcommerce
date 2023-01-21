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
        <div className=" flex text-white bg-[#111727] border-solid border-2 border-white hover:bg-[#111727]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-3 xs:px-5 py-2.5 text-center  items-center dark:focus:ring-[#4285F4]/55 ">
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

const SidebarSignOut = () => {
  return (
    <div className="grid sm:hidden place-items-center rounded-md">
      <Link
        href="/api/auth/signout"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
      >
        <div className=" flex text-white bg-[#111727] border-solid border-2 border-white hover:bg-[#111727]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-3 xs:px-5 py-2.5 text-center  items-center dark:focus:ring-[#4285F4]/55 ">
          <span className="inline-block">Sign Out</span>
        </div>
      </Link>
    </div>
  );
};

const Sidebar: React.FC<Props> = ({ handleShowSideMenu, session }) => {
  return (
    <div className="absolute h-[100vh] w-[240px]  bg-[#111727] z-50 right-0 sm:hidden flex flex-col gap-[24px] rounded-tl-3xl rounded-bl-3xl">
      <div className="bg-[#343b48] flex py-4 pr-1 justify-end rounded-tl-3xl ">
        <button
          type="button"
          className="p-0 rounded-md inline-flex items-center h-10 w-12 justify-center text-white border-white border-[4px]"
          onClick={handleShowSideMenu}
        >
          <span className="sr-only">Close menu</span>
          <svg
            className="h-10 w-12"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
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
      {session ? <SidebarSignOut /> : <SidebarSignIn />}

      <Link href={"/"}>
        <div className="h-[60px] flex justify-center items-center gap-3 cursor-pointer text-center hover:bg-[#1a2031] hover:bg-opacity-70 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className="w-[25px] h-[25px] fill-white "
          >
            <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
          </svg>

          <p>Home</p>
        </div>
      </Link>

      <Link href={"/contact"}>
        <div className="h-[60px] flex justify-center items-center gap-3 cursor-pointer text-center hover:bg-[#1a2031] hover:bg-opacity-70 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-[25px] h-[25px] fill-white "
          >
            <path d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
          </svg>
          <p>Contact</p>
        </div>
      </Link>

      {session && (
        <Link href={"/profile"}>
          <div className="h-[60px] flex justify-center items-center gap-3 cursor-pointer text-center hover:bg-[#1a2031] hover:bg-opacity-70 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-[25px] h-[25px] fill-white "
            >
              <path d="M272 304h-96C78.8 304 0 382.8 0 480c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32C448 382.8 369.2 304 272 304zM48.99 464C56.89 400.9 110.8 352 176 352h96c65.16 0 119.1 48.95 127 112H48.99zM224 256c70.69 0 128-57.31 128-128c0-70.69-57.31-128-128-128S96 57.31 96 128C96 198.7 153.3 256 224 256zM224 48c44.11 0 80 35.89 80 80c0 44.11-35.89 80-80 80S144 172.1 144 128C144 83.89 179.9 48 224 48z" />
            </svg>
            <p>Profile</p>
          </div>
        </Link>
      )}

      <Link href={"/about"}>
        <div className="h-[60px] flex justify-center items-center gap-3 cursor-pointer text-center hover:bg-[#1a2031] hover:bg-opacity-70 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
            className="w-[25px] h-[25px] fill-white "
          >
            <path d="M48 0C21.5 0 0 21.5 0 48V464c0 26.5 21.5 48 48 48h96V432c0-26.5 21.5-48 48-48s48 21.5 48 48v80h96c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H48zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM80 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V112zM272 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16z" />
          </svg>

          <p>About</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
