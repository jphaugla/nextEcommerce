// utils/hooks/useDecrementQuantity.ts
export function useDecrementQuantity() {
  const decrementCartItem = async (cartItemId: string) => {
    const res = await fetch("/api/cart/decrementCartItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    if (!res.ok) throw new Error(await res.text());

    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };
  return { decrementCartItem };
}
