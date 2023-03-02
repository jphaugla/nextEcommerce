import { ApolloError, useQuery } from "@apollo/client";
import { GET_CART_BY_EMAIL } from "../gqlQueries/queries";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react'
import { Cart, CartItem } from "@/types/cartItems";

//Work on this

// export const useRemoveItem = () => {
//   const { data: session, status: loadingSession } = useSession();
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     const getEmail = async () => {
//       if (!session?.user?.email) return;
//       if (!(email === session.user.email)) {
//         setEmail(session.user.email);
//       }
//     };
//     getEmail()
//   }, [session]);

//   const { loading: loadingGraphQL, error, data } = useQuery(GET_CART_BY_EMAIL, {
//     variables: { email: email },
//   });

//   let cartObj: Cart | null = data?.getCartByEmail
//   const { cartId, cartItems } = cartObj || { cartId: null, cartItems: null }
//   return { session, error, email, cartId, cartItems };
// }
