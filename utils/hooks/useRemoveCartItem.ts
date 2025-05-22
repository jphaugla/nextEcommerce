// utils/hooks/useRemoveCartItem.ts
export function useRemoveCartItem() {
  const removeCartItem = async (cartItemId: string) => {
    const res = await fetch("/api/cart/removeItem", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    if (!res.ok) throw new Error(await res.text());

    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };
  return { removeCartItem };
}
