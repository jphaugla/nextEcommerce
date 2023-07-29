import React, { useEffect, useState } from 'react'
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { UPDATE_CART_ITEM } from "../gqlQueries/mutations";
import { useGetCartByEmail } from "./useGetCartByEmail";
import { useMutation } from "@apollo/client";

export const useIncrementQuantity = (itemId: string) => {
  const { session, cartId, cartItems } = useGetCartByEmail()

  const [updateCartItem, { data, loading, error }] = useMutation(UPDATE_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });
  const handleIncrementCartItem = async () => {
    if (!session || !cartItems) return;
    const cartItem = cartItems.find((obj) => obj.id === itemId);
    console.log("Cart Item:", cartItem)
    if (!cartItem) return;
    try {
      const {
        alt,
        cartId,
        category,
        description,
        discontinued,
        height,
        id,
        itemId,
        length,
        name,
        price,
        quantity,
        src,
        stock,
        weight,
        width
      } = cartItem
      if (quantity === stock) {
        return
      }
      let res = await updateCartItem({
        variables: {
          alt,
          cartId,
          category,
          description,
          discontinued,
          height,
          id,
          itemId,
          length,
          name,
          price,
          quantity: quantity + 1,
          src,
          stock,
          weight,
          width
        },
      })
      console.log("response:", res)
    } catch (err) {
      console.log("error message:", err)
    }
  }
  return { handleIncrementCartItem, loading, error, session };
}