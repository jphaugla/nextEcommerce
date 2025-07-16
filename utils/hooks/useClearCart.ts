// utils/hooks/useClearCart.ts
import { useCallback } from "react";

export function useClearCart() {
  const clearCart = useCallback(async (cartId: string) => {
    const res = await fetch("/api/cart/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to clear cart");
    }
    // notify any listening hooks/components
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return { clearCart };
}
