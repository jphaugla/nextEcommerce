import React, { useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const { cartItems, refreshCart } = useGetCartByEmail();

  // on auth
  useEffect(() => {
    if (status === "authenticated") refreshCart();
  }, [status, refreshCart]);

  // on any cartUpdated event
  useEffect(() => {
    const handler = () => refreshCart();
    window.addEventListener("cartUpdated", handler);
    return () => {
      window.removeEventListener("cartUpdated", handler);
    };
  }, [refreshCart]);

  const badgeCount = cartItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <Link href="/" className="text-2xl font-bold">MyStore</Link>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            <Link href="/cart" className="relative text-xl">
              🛒
              {badgeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 rounded-full w-5 h-5 text-xs grid place-items-center">
                  {badgeCount}
                </span>
              )}
            </Link>
            <span>{session.user?.email}</span>
            <button onClick={() => signOut()} className="underline">Sign out</button>
          </>
        ) : (
          <Link href="/api/auth/signin" className="underline">Sign in</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
