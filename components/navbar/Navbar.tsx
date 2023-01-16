import React from "react";
import { useSession } from "next-auth/react";

import { NextPage } from "next/types";

import TitleContainer from "./subcomponents/TitleContainer";
import BaseLinks from "./subcomponents/BaseLinks";
import AuthLinks from "./subcomponents/AuthLinks";

const Navbar: NextPage = () => {
  const { data: session, status: loading } = useSession();

  return (
    <div className="flex justify-between p-2 mx-8">
      <TitleContainer />
      {session && <BaseLinks />}
      <AuthLinks session={session} />
    </div>
  );
};

export default Navbar;
