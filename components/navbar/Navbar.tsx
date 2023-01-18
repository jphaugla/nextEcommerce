import React from "react";
import { useSession } from "next-auth/react";

import { NextPage } from "next/types";

import TitleContainer from "./subcomponents/TitleContainer";
import BaseLinks from "./subcomponents/BaseLinks";
import AuthLinks from "./subcomponents/AuthLinks";
import HamburgerMenu from "./subcomponents/HamburgerMenu";
import CartIcon from "./subcomponents/CartIcon";
import Sidebar from "../sidebar/Sidebar";

const Navbar: NextPage = () => {
  const { data: session, status: loading } = useSession();

  const [showSideMenu, setShowSideMenu] = React.useState<boolean>(false);
  const [numItems, setNumItems] = React.useState<number>(0);

  const handleShowSideMenu: () => void = () => {
    setShowSideMenu(!showSideMenu);
    console.log("showSideMenu:", showSideMenu);
  };

  return (
    <>
      {showSideMenu && (
        <Sidebar handleShowSideMenu={handleShowSideMenu} session={session} />
      )}
      <div className="flex justify-between px-2 py-4 bg-slate-100">
        <TitleContainer />
        <BaseLinks session={session} />
        <AuthLinks session={session} />
        <HamburgerMenu
          session={session}
          handleShowSideMenu={handleShowSideMenu}
        />
      </div>
    </>
  );
};

export default Navbar;
