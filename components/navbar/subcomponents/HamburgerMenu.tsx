import React from "react";
import CartIcon from "./CartIcon";
import type { Session } from "next-auth";

interface Props {
  handleShowSideMenu: () => void;
  session: Session | null;
}

const HamburgerMenu: React.FC<Props> = ({ handleShowSideMenu, session }) => {
  return (
    <div className="flex justify-between align-middle gap-5 sm:hidden">
      {session && <CartIcon numItems={3} />}
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
