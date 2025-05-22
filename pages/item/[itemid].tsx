// pages/item/[itemid].tsx

import React, { useState, useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { signIn, getSession } from "next-auth/react";
import ItemCard from "@/components/itemCard/ItemCard";
import ErrorModalContainer from "@/components/modal/ErrorModalContainer";
import client from "@/services/apollo-client";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { useAddItem } from "@/utils/hooks/useAddItem";
import { useDecrementQuantity } from "@/utils/hooks/useDecrementQuantity";
import { useIncrementQuantity } from "@/utils/hooks/useIncrementQuantity";
import { useRemoveItem } from "@/utils/hooks/useRemoveItem";
import { GET_ITEMS } from "@/utils/gqlQueries/queries";
import { Product } from "@/types/items";
import { ApolloError } from "@apollo/client";

interface Props {
  session: any;
  products: Product[];
  itemId: string;
  error?: ApolloError | null;
}

const ItemDetailCardPage: NextPage<Props> = ({ products, itemId }) => {
  const {
    session,
    status,
    cartId,
    cartItems,
    loading: cartLoading,
    error: cartError,
  } = useGetCartByEmail();

  if (status === "loading") {
    return <div className="h-full grid place-items-center">Loading session…</div>;
  }
  if (!session) {
    return (
      <div className="h-full grid place-items-center">
        <p>Please sign in to add items to your cart.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Pass the already‐loaded session & cartId into the add hook
  const { handleAddCartItem } = useAddItem(itemId, session, cartId!);
  const { handleIncrementCartItem } = useIncrementQuantity(itemId);
  const { handleDecrementCartItem } = useDecrementQuantity(itemId);
  const { handleRemoveCartItem } = useRemoveItem(itemId);

  const [showModal, setShowModal] = useState(false);
  const [errCart, setErrCart] = useState("");
  const [qtyInCart, setQtyInCart] = useState(0);

  // Seed the local qty from fetched cartItems
  useEffect(() => {
    const current = cartItems?.find((ci) => ci.itemId === itemId);
    setQtyInCart(current ? current.quantity : 0);
  }, [cartItems, itemId]);

  const toggleModal = () => setShowModal((v) => !v);

  const handleModalAddItem = async () => {
    if (cartLoading) return;
    setQtyInCart((q) => q + 1);
    try {
      if (qtyInCart > 0) {
        await handleIncrementCartItem();
      } else {
        await handleAddCartItem(1);
      }
    } catch (e: any) {
      setQtyInCart((q) => Math.max(0, q - 1));
      setErrCart(e.message || "Unknown error");
      setShowModal(true);
    }
  };

  const handleModalDecrementItem = async () => {
    if (cartLoading) return;
    setQtyInCart((q) => Math.max(0, q - 1));
    try {
      if (qtyInCart > 1) {
        await handleDecrementCartItem();
      } else if (qtyInCart === 1) {
        await handleRemoveCartItem();
      }
    } catch (e: any) {
      setQtyInCart((q) => q + 1);
      setErrCart(e.message || "Unknown error");
      setShowModal(true);
    }
  };

  const product = products.find((p) => p.id === itemId) || null;

  return (
    <>
      {showModal && (
        <ErrorModalContainer
          closeModal={toggleModal}
          show={showModal}
          title="Error"
          text={errCart}
        />
      )}
      <div className="h-full grid place-items-center bg-slate-500">
        {product && (
          <ItemCard
            product={product}
            qtyInCart={qtyInCart}
            handleModalAddItem={handleModalAddItem}
            handleModalDecrementItem={handleModalDecrementItem}
          />
        )}
      </div>
    </>
  );
};

export default ItemDetailCardPage;

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getSession({ req: ctx.req });
  const { data, error } = await client.query({ query: GET_ITEMS });
  const products: Product[] = data.items;
  const itemId = ctx.resolvedUrl.split("/")[2] || "notFound";

  return {
    props: {
      session,
      products,
      itemId,
      error: error ?? null,
    },
  };
};
