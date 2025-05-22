// pages/item/[itemid].tsx

import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import { signIn, getSession } from "next-auth/react";
import ItemCard from "@/components/itemCard/ItemCard";
import ErrorModalContainer from "@/components/modal/ErrorModalContainer";
import { prisma } from "@/services/prisma-client";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { useAddCartItem } from "@/utils/hooks/useAddCartItem";
import { useIncrementQuantity } from "@/utils/hooks/useIncrementQuantity";
import { useDecrementQuantity } from "@/utils/hooks/useDecrementQuantity";
import { useRemoveCartItem } from "@/utils/hooks/useRemoveCartItem";
import { Product } from "@/types/items";

interface Props {
  session: any;
  products: Product[];
  itemId: string;
}

const ItemDetailPage: NextPage<Props> = ({ products, itemId }) => {
  // Fetch cart & auth state
  const {
    session,
    status,        // 'loading' | 'authenticated' | 'unauthenticated'
    cartId,
    cartItems,
    loading: cartLoading,
    refreshCart,
    error: cartError,
  } = useGetCartByEmail();

  // Mutation hooks
  const { addCartItem }        = useAddCartItem();
  const { incrementCartItem }  = useIncrementQuantity();
  const { decrementCartItem }  = useDecrementQuantity();
  const { removeCartItem }     = useRemoveCartItem();

  // Local UI state
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [qtyInCart, setQtyInCart]   = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [errCart, setErrCart]       = useState<string>("");

  // Sync local state from hook data
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

  // Loading indicator
  if (status === "loading") {
    return (
      <div className="h-full grid place-items-center">Loading session…</div>
    );
  }

  // Prompt to sign in
  if (!session) {
    return (
      <div className="h-full grid place-items-center">
        <p>Please sign in to view and add items to your cart.</p>
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

  const handleAdd = async () => {
    if (cartLoading) return;
    // Optimistic UI update
    setQtyInCart((q) => q + 1);
    try {
      if (qtyInCart > 0 && cartItemId) {
        await incrementCartItem(cartItemId);
      } else if (cartId) {
        await addCartItem(cartId, itemId, 1);
      }
      await refreshCart();
    } catch (e: any) {
      // Roll back
      setQtyInCart((q) => Math.max(0, q - 1));
      setErrCart(e.message || "Could not add to cart");
      setShowModal(true);
    }
  };

  const handleRemove = async () => {
    if (cartLoading || !cartItemId) return;
    // Optimistic UI
    setQtyInCart((q) => Math.max(0, q - 1));
    try {
      if (qtyInCart > 1) {
        await decrementCartItem(cartItemId);
      } else {
        await removeCartItem(cartItemId);
      }
      await refreshCart();
    } catch (e: any) {
      // Roll back
      setQtyInCart((q) => q + 1);
      setErrCart(e.message || "Could not remove from cart");
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
          title="Cart Error"
          text={errCart || cartError || "An error occurred"}
        />
      )}

      <div className="h-full grid place-items-center bg-slate-500">
        {product && (
          <ItemCard
            product={product}
            qtyInCart={qtyInCart}
            handleModalAddItem={handleAdd}
            handleModalDecrementItem={handleRemove}
          />
        )}
      </div>
    </>
  );
};

export default ItemDetailPage;

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // Inject session for SSR, if you need it in props
  const session = await getSession({ req: ctx.req });

  // Fetch all products from your local DB
  const products = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });

  // Extract itemId from URL
  const itemId = ctx.resolvedUrl.split("/")[2] || "";

  return {
    props: {
      session,
      products: JSON.parse(JSON.stringify(products)),
      itemId,
    },
  };
};

