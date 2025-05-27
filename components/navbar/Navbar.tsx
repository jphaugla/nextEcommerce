// components/navbar/Navbar.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const {
    cartItems,
    loading: cartLoading,
    refreshCart,
  } = useGetCartByEmail();
  const [badgeCount, setBadgeCount] = useState(0);

  // Recompute badge when cartItems change
  useEffect(() => {
    if (cartItems) {
      const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setBadgeCount(total);
    }
  }, [cartItems]);

  // Listen for custom cartUpdated events
  useEffect(() => {
    const handler = () => refreshCart();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [refreshCart]);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-slate-100">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-2xl font-bold">
          ShopLogo
        </Link>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact
        </Link>

        {session && (
          <>
            <Link href="/orders" className="hover:underline">
              Order History
            </Link>
            <Link href="/generate-load" className="hover:underline">
              Generate Load
            </Link>
          </>
        )}

        {session && (
          <>
            <Link href="/inventory" className="hover:underline">
              Inventory
            </Link>
            <Link
              href="/inventory-transactions"
              className="hover:underline"
            >
              Inventory Transactions
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {status === "loading" ? null : !session ? (
          <button
            onClick={() => signIn("google")}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Sign In
          </button>
        ) : (
          <>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Sign Out
            </button>
            <Link href="/cart" className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6M17 13l1.2 6M6 19a1 1 0 102 0 1 1 0 00-2 0zm12 0a1 1 0 102 0 1 1 0 00-2 0z"
                />
              </svg>
              {badgeCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {badgeCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
