import React, { useEffect } from "react";
import CartIcon from "./CartIcon";
import type { Session } from "next-auth";
import { CartItem } from "@/types/cartItems";
interface Props {
  handleShowSideMenu: () => void;
  session: Session | null;
  cartItems: CartItem[] | null;
}

const HamburgerMenu: React.FC<Props> = ({
  handleShowSideMenu,
  session,
  cartItems,
}) => {
  const numItems = cartItems
    ? cartItems.reduce((acc, cartItem: CartItem) => {
        return acc + Number(cartItem.quantity);
      }, 0)
    : 0;
  return (
    <div className="flex justify-between align-middle gap-5 sm:hidden">
      {session && <CartIcon numItems={numItems} />}
      <button
        type="button"
        className="bg-slate-100 p-2 rounded-md text-gray-500"
        onClick={handleShowSideMenu}
      >
        <span className="sr-only">Open menu</span>
        <div className="p-2 space-y-2 bg-slate-100 rounded shadow-lg">
          <span className="block w-8 h-0.5 bg-gray-700 animate-pulse"></span>
          <span className="block w-8 h-0.5 bg-gray-700 animate-pulse"></span>
          <span className="block w-8 h-0.5 bg-gray-700 animate-pulse"></span>
        </div>
      </button>
    </div>
  );
};

export default HamburgerMenu;
