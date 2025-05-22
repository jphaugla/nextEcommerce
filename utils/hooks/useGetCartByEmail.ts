// utils/hooks/useGetCartByEmail.ts

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

export function useGetCartByEmail() {
  const { data: session, status } = useSession();
  const [cartId, setCartId]       = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.email) return;
    setLoading(true);
    setError(null);

    try {
      // 1) Ensure cart exists and get cartId
      const cartRes = await fetch("/api/getCart", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      if (!cartRes.ok) {
        throw new Error(await cartRes.text());
      }
      const { cartId: id } = await cartRes.json();
      setCartId(id);

      // 2) Fetch the items in that cart
      const itemsRes = await fetch(`/api/cartItems?cartId=${id}&_=${Date.now()}`, {
        cache: "no-store",
      });
      if (!itemsRes.ok) {
        throw new Error(await itemsRes.text());
      }
      const { items } = await itemsRes.json();
      setCartItems(items);
    } catch (e: any) {
      console.error("refreshCart error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated") {
      void refreshCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [status, refreshCart]);

  return {
    session,
    status,      // "loading" | "authenticated" | "unauthenticated"
    cartId,
    cartItems,
    loading,
    error,
    refreshCart,
  };
}
