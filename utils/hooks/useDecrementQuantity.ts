import React, { useEffect, useState } from 'react'
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { UPDATE_CART_ITEM } from "../gqlQueries/mutations";
import { useGetCartByEmail } from "./useGetCartByEmail";
import { useMutation } from "@apollo/client";

export const useDecrementQuantity = (itemId: string) => {
  const { error: queryError, session, cartId, cartItems } = useGetCartByEmail()
  if (!cartItems) return
  let cartItem = cartItems.filter(obj => obj.itemId = itemId)[0]

  const [updateCartItem, { data, loading, error }] = useMutation(UPDATE_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });
  const handleDecrementCartItem = async () => {
    if (!session) return
    try {
      let res = await updateCartItem({
        variables: {
          itemId: itemId,
          cartId: cartId,
          quantity: cartItem.quantity - 1,
        },
      })
      console.log("response:", res)
    } catch (err) {
      console.log("error message:", err)
    }
  }
  return { handleDecrementCartItem, loading, error, session };
}