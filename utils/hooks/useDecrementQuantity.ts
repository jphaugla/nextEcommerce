import React, { useEffect, useState } from 'react'
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { UPDATE_CART_ITEM, REMOVE_CART_ITEM } from "../gqlQueries/mutations";

import { useGetCartByEmail } from "./useGetCartByEmail";
import { useMutation } from "@apollo/client";
import client from "@/services/apollo-client";

export const useDecrementQuantity = (itemId: string) => {
  const { session, cartId, cartItems } = useGetCartByEmail()
  const [updateCartItem, { data: dataUpdate, loading: loadingUpdate, error: errorUpdate }] = useMutation(UPDATE_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });
  const [removeCartItem, { data: dataRemove, loading: loadingRemove, error: errorRemove }] = useMutation(REMOVE_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });

  const loading = loadingRemove || loadingUpdate
  const error = errorUpdate || errorRemove

  const handleDecrementCartItem = async () => {
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

      if (quantity === 1) {
        let res = await removeCartItem({
          variables: {
            cartId,
            itemId,
          },
        })
        if (res.data && res.data.RemoveCartItem) {
          client.writeQuery({
            query: GET_CART_BY_EMAIL,
            variables: { email: session.user.email },
            data: { getCartByEmail: res.data.RemoveCartItem },
          });
        }
      } else {
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
            quantity: quantity - 1,
            src,
            stock,
            weight,
            width
          },
        })
        if (res.data && res.data.updateCartItem) {
          const updatedCartData = res.data.updateCartItem;
          console.log("res.data.updateCartItem:", res.data.updateCartItem)
          client.writeQuery({
            query: GET_CART_BY_EMAIL,
            variables: { email: session.user.email },
            data: { getCartByEmail: updatedCartData },
          });
        }
      }

























    } catch (err) {
      console.log("error message:", err)
    }
  }
  return { handleDecrementCartItem, loading, error, session };
}