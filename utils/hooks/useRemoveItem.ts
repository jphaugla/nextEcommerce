import { ApolloError, useQuery, useMutation } from "@apollo/client";
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { REMOVE_CART_ITEM } from "../gqlQueries/mutations";
import React, { useEffect, useState } from 'react'
import { useGetCartByEmail } from "./useGetCartByEmail";
import { Cart, CartItem } from "@/types/cartItems";
import client from "@/services/apollo-client";

export const useRemoveItem = (itemId: string) => {
  const { session, cartItems } = useGetCartByEmail()
  const [removeCartItem, { data, loading, error }] = useMutation(REMOVE_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });

  const handleRemoveCartItem = async () => {
    if (!session || !cartItems) return;
    const cartItem = cartItems.find((obj) => obj.id === itemId);
    if (!cartItem) return;
    const remainingCartItems = cartItems.filter(obj => obj.id !== itemId)
    try {
      const {
        cartId,
        itemId
      } = cartItem

      let res = await removeCartItem({
        variables: {
          cartId,
          itemId,
        },
      })
      console.log("REMOVAL COMPLETE")
      console.log("res.data.RemoveCartItem:", res.data.RemoveCartItem)

      if (res.data && res.data.RemoveCartItem) {
        client.writeQuery({
          query: GET_CART_BY_EMAIL,
          variables: { email: session.user.email },
          data: { getCartByEmail: res.data.RemoveCartItem },
        });
      }
    } catch (err) {
      console.log("error message:", err)
    }
  }
  return { handleRemoveCartItem, loading, error, session };
}

