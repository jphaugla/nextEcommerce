import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { NextPage } from "next/types";

import TitleContainer from "./subcomponents/TitleContainer";
import BaseLinks from "./subcomponents/BaseLinks";
import AuthLinks from "./subcomponents/AuthLinks";
import HamburgerMenu from "./subcomponents/HamburgerMenu";
import CartIcon from "./subcomponents/CartIcon";
import Sidebar from "../sidebar/Sidebar";
import { prisma } from "../../services/prisma-client";
const Navbar: NextPage = () => {
  const { data: session, status: loading } = useSession();
  const [showSideMenu, setShowSideMenu] = React.useState<boolean>(false);
  const [numItems, setNumItems] = React.useState<number>(0);

  const [cartId, setCartId] = useState("");
  const [email, setEmail] = useState("");

  const handleGetCartId = async (email: string) => {
    return fetch("api/getCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }).then((res) => res.json());
  };

  useEffect(() => {
    const getCartId = async () => {
      if (!session) return;
      if (!session.user?.email) return;
      if (!(email === session.user.email)) {
        console.log("new Email detected...");
        setEmail(session.user.email);
        let { cartId } = await handleGetCartId(session.user.email);
        setCartId(cartId);
      }
    };
    getCartId();
  }, [session]);

  useEffect(() => {
    console.log("Email:", email);
  }, [email]);
  useEffect(() => {
    console.log("CartId:", cartId);
  }, [cartId]);

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
