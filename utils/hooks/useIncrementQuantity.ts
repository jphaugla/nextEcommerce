// utils/hooks/useIncrementQuantity.ts
export function useIncrementQuantity() {
  const incrementCartItem = async (cartItemId: string) => {
    const res = await fetch("/api/incrementCartItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    if (!res.ok) throw new Error(await res.text());

    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };
  return { incrementCartItem };
}
