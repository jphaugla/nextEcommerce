import React, { useEffect, useState } from "react";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { NextPage } from "next/types";
import TitleContainer from "./subcomponents/TitleContainer";
import BaseLinks from "./subcomponents/BaseLinks";
import AuthLinks from "./subcomponents/AuthLinks";
import HamburgerMenu from "./subcomponents/HamburgerMenu";
import CartIcon from "./subcomponents/CartIcon";
import Sidebar from "../sidebar/Sidebar";
import { useRouter } from "next/router";

const Navbar: NextPage = () => {
  const { error, session, email, cartId, cartItems } = useGetCartByEmail();
  const [showSideMenu, setShowSideMenu] = React.useState<boolean>(false);

  useEffect(() => {
    console.log("Email:", email);
    console.log("cartId:", cartId);
    console.log("cartItems:", cartItems);
  }, [email, cartId]);

  const handleShowSideMenu: () => void = () => {
    setShowSideMenu(!showSideMenu);
  };

  return (
    <>
      {showSideMenu && (
        <Sidebar handleShowSideMenu={handleShowSideMenu} session={session} />
      )}
      <div className="flex justify-between px-2 py-4 bg-slate-100">
        <TitleContainer />
        <BaseLinks session={session} />
        <AuthLinks session={session} cartItems={cartItems} />
        <HamburgerMenu
          session={session}
          handleShowSideMenu={handleShowSideMenu}
          cartItems={cartItems}
        />
      </div>
    </>
  );
};

export default Navbar;
