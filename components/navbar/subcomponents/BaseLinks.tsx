import React from "react";
import Link from "next/link";
interface Props {}

const BaseLinks = () => {
  return (
    <div className="flex gap-3">
      <div className="grid place-items-center p-2 rounded-md hover:ring-4">
        <Link href="/">Home</Link>
      </div>
      <div className="grid place-items-center p-2 rounded-md hover:ring-4">
        <Link href="/profile">Profile</Link>
      </div>
      <div className="grid place-items-center p-2 rounded-md hover:ring-4">
        <Link href="/cart">Cart</Link>
      </div>
      <div className="grid place-items-center p-2 rounded-md hover:ring-4">
        <Link href="/checkout">Checkout</Link>
      </div>
    </div>
  );
};

export default BaseLinks;
