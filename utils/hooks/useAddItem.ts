import { ApolloError, useQuery, useMutation } from "@apollo/client";
import React, { useEffect, useState } from 'react'
import { Cart, CartItem } from "@/types/cartItems";
import { ADD_CART_ITEM } from "../gqlQueries/mutations";
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { useGetCartByEmail } from "./useGetCartByEmail";

export const useAddItem = (itemId: string) => {
  const { error: queryError, session, cartId } = useGetCartByEmail()
  const [addCartItem, { data, loading, error }] = useMutation(ADD_CART_ITEM, { refetchQueries: [{ query: GET_CART_BY_EMAIL }], });

  const handleAddCartItem = async (quantity: number) => {
    if (!session) return
    try {
      let res = await addCartItem({
        variables: {
          itemId: itemId,
          cartId: cartId,
          quantity: quantity,
        },
      })
      console.log("response:", res)
    } catch (err) {
      console.log("error message:", err)
    }
  }
  return { handleAddCartItem, loading, error, session };
}


