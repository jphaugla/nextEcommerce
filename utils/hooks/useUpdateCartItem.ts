// utils/hooks/useUpdateCartItem.ts
export function useUpdateCartItem() {
  const updateCartItem = async (cartItemId: string, quantity: number) => {
    const res = await fetch("/api/cart/updateItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });
    if (!res.ok) throw new Error(await res.text());

    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };
  return { updateCartItem };
}
