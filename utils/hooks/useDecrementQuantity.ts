import React, { useEffect, useState } from 'react'
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { UPDATE_CART_ITEM, REMOVE_CART_ITEM } from "../gqlQueries/mutations";

import { useGetCartByEmail } from "./useGetCartByEmail";
import { useMutation } from "@apollo/client";
import client from "@/services/apollo-client";

export function useDecrementQuantity(cartItemId: string | null) {
  const handleDecrementCartItem = async () => {
    if (!cartItemId) {
      console.error("decrement: no cartItemId");
      return;
    }
    const res = await fetch("/api/decrementCartItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    if (!res.ok) {
      console.error("decrement failed:", await res.text());
    }
  };

  return { handleDecrementCartItem };
}

