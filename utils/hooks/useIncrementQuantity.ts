import React, { useEffect, useState } from 'react'
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { UPDATE_CART_ITEM } from "../gqlQueries/mutations";
import { useGetCartByEmail } from "./useGetCartByEmail";
import { useMutation } from "@apollo/client";

export function useIncrementQuantity(cartItemId: string | null) {
  const handleIncrementCartItem = async () => {
    if (!cartItemId) {
      console.error("increment: no cartItemId");
      return;
    }
    const res = await fetch("/api/incrementCartItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    if (!res.ok) {
      console.error("increment failed:", await res.text());
    }
  };

  window.dispatchEvent(new Event("cartUpdated"));
  return { handleIncrementCartItem };
}

