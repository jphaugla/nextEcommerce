// pages/item/[itemid].tsx

import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import { signIn, getSession } from "next-auth/react";
import ItemCard from "@/components/itemCard/ItemCard";
import ErrorModalContainer from "@/components/modal/ErrorModalContainer";
import client from "@/services/apollo-client";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { useAddItem } from "@/utils/hooks/useAddItem";
import { useIncrementQuantity } from "@/utils/hooks/useIncrementQuantity";
import { useDecrementQuantity } from "@/utils/hooks/useDecrementQuantity";
import { useRemoveItem } from "@/utils/hooks/useRemoveItem";
import { GET_ITEMS } from "@/utils/gqlQueries/queries";
import { Product } from "@/types/items";

interface Props {
  session: any;
  products: Product[];
  itemId: string;
}

const ItemDetailCardPage: NextPage<Props> = ({ products, itemId }) => {
  const {
    session,
    status,
    cartId,
    cartItems,
    loading: cartLoading,
    refreshCart,
  } = useGetCartByEmail();

  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [qtyInCart, setQtyInCart] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [errCart, setErrCart] = useState("");

  // sync local state with fetched cartItems
  useEffect(() => {
    const current = cartItems?.find((ci) => ci.itemId === itemId);
    if (current) {
      setCartItemId(current.id);
      setQtyInCart(current.quantity);
    } else {
      setCartItemId(null);
      setQtyInCart(0);
    }
  }, [cartItems, itemId]);

  // prepare mutation hooks, passing the correct IDs
  const { handleAddCartItem } = useAddItem(itemId, session, cartId!);
  const { handleIncrementCartItem } = useIncrementQuantity(cartItemId);
  const { handleDecrementCartItem } = useDecrementQuantity(cartItemId);
  const { handleRemoveCartItem } = useRemoveItem(cartItemId);

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

  const toggleModal = () => setShowModal((v) => !v);

  const handleModalAddItem = async () => {
    if (cartLoading) return;
    // optimistic UI
    setQtyInCart((q) => q + 1);
    try {
      if (qtyInCart > 0) {
        await handleIncrementCartItem();
      } else {
        await handleAddCartItem(1);
      }
      await refreshCart();
    } catch (e: any) {
      // rollback
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
      await refreshCart();
    } catch (e: any) {
      // rollback
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
  const { data } = await client.query({ query: GET_ITEMS });
  const products: Product[] = data.items;
  const itemId = ctx.resolvedUrl.split("/")[2] || "notFound";
  return {
    props: {
      session,
      products,
      itemId,
    },
  };
};
