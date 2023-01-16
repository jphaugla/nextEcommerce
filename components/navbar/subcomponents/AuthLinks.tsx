import React from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

interface Props {
  session: Session | null;
}

const SignIn = () => {
  return (
    <div className="grid place-items-center p-2 rounded-md hover:ring-4">
      <Link
        href="/api/auth/signin"
        onClick={(e) => {
          e.preventDefault();
          signIn();
        }}
      >
        Sign In
      </Link>
    </div>
  );
};

const SignOut = () => {
  return (
    <div className="grid place-items-center p-2 rounded-md hover:ring-4">
      <Link
        href="/api/auth/signout"
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
  );
};

const AuthLinks: React.FC<Props> = ({ session }) => {
  return <div className="flex gap-3">{session ? <SignOut /> : <SignIn />}</div>;
};

export default AuthLinks;
