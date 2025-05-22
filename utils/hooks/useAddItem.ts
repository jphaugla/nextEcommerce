// utils/hooks/useAddItem.ts

export function useAddItem(
  itemId: string,
  session: any,
  cartId: string | null
) {
  const handleAddCartItem = async (quantity: number) => {
    console.log("🔔 useAddItem called", { itemId, quantity, session, cartId });
    if (!session || !cartId) {
      console.error("Cannot add item: no session or cartId");
      return;
    }
    try {
      console.log("🔔 Sending POST /api/addCartItem");
      const res = await fetch("/api/addCartItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, itemId, quantity }),
      });
      console.log("🔔 Response status:", res.status);
      const payload = await res.json();
      console.log("🔔 Response payload:", payload);
      if (!res.ok || payload.error) {
        console.error("addCartItem error:", payload.error || res.statusText);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  return { handleAddCartItem };
}

