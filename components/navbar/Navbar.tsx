import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

interface Props {}

const TitleContainer = () => {
  return <div>Navigation</div>;
};

const BaseLinks = () => {
  return (
    <div>
      <Link href="/">Home</Link>
      <Link href="/dashboard">dashboard</Link>
    </div>
  );
};

const AuthLinks = () => {
  return (
    <div>
      <Link
        href="/api/auth/signin"
        onClick={(e) => {
          e.preventDefault();
          signIn();
        }}
      >
        Sign In
      </Link>

      <Link
        href="/api/auth/signout"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
      >
        Sign Out
      </Link>
    </div>
  );
};

const Navbar = () => {
  return (
    <div>
      <TitleContainer />
      <BaseLinks />
      <AuthLinks />
    </div>
  );
};

export default Navbar;
