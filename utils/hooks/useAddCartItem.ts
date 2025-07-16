// utils/hooks/useAddCartItem.ts
export function useAddCartItem() {
  const addCartItem = async (cartId: string, itemId: string, quantity: number) => {
    const res = await fetch("/api/cart/addCartItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId, itemId, quantity }),
    });
    if (!res.ok) throw new Error(await res.text());

    // defer so React finishes rendering before Navbar state updates
    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };
  return { addCartItem };
}
