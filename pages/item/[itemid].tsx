import React, { useState, useEffect, useCallback } from "react";
import { GetServerSideProps, NextPage } from "next";
import ItemCard from "@/components/itemCard/ItemCard";
import ErrorModalContainer from "@/components/modal/ErrorModalContainer";
import client from "@/services/apollo-client";
import { useAddItem } from "@/utils/hooks/useAddItem";
import { GET_ITEMS } from "@/utils/gqlQueries/queries";
import { Product } from "@/types/items";
import { ApolloError } from "@apollo/client";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { useDecrementQuantity } from "@/utils/hooks/useDecrementQuantity";
import { useIncrementQuantity } from "@/utils/hooks/useIncrementQuantity";
import { useRemoveItem } from "@/utils/hooks/useRemoveItem";

interface Props {
  products: Product[];
  itemId: string;
  error?: ApolloError;
}

const ItemDetailCardPage: NextPage<Props> = ({ products, itemId }) => {
  const {
    handleAddCartItem,
    loading,
    error: cartErr,
    session,
  } = useAddItem(itemId);

  const [showModal, setShowModal] = useState(false);
  const [errSession, setErrSession] = useState("");
  const [errCart, setErrCart] = useState("");
  const [cartItemId, setCartItemId] = useState("");
  const [qtyInCart, setQtyInCart] = useState(0);

  const { handleDecrementCartItem } = useDecrementQuantity(cartItemId);
  const { handleIncrementCartItem } = useIncrementQuantity(cartItemId);

  useEffect(() => {
    if (!session) {
      setErrSession("Please Sign in before adding to cart.");
    } else {
      setErrSession("");
    }
  }, [session]);

  useEffect(() => {
    if (cartErr) {
      setErrCart("Error with Cart");
      setShowModal(true);
    } else {
      setErrCart("");
    }
  }, [cartErr]);

  const { cartItems } = useGetCartByEmail();

  useEffect(() => {
    let currentItem = cartItems?.find((obj) => obj.itemId === itemId);
    if (!!currentItem) {
      setCartItemId(currentItem.id);
      setQtyInCart(currentItem.quantity);
    } else {
      setCartItemId("");
      setQtyInCart(0);
    }
    console.log("cartID:", cartItemId);
    console.log("itemID:", itemId);
  }, [cartItemId, cartItems]);

  const handleModalAddItem = async () => {
    if (loading) return;
    if (!(errCart === "") || !(errSession === "")) {
      setShowModal(true);
    } else {
      try {
        if (qtyInCart > 0) {
          await handleIncrementCartItem();
        } else {
          await handleAddCartItem(1);
        }
      } catch (cartErr) {
        if (typeof cartErr === "string") setErrCart(cartErr as string);
      }
    }
  };
  const handleModalDecrementItem = async () => {
    if (loading) return;
    if (!(errCart === "") || !(errSession === "")) {
      setShowModal(true);
    } else {
      try {
        await handleDecrementCartItem();
      } catch (cartErr) {
        if (typeof cartErr === "string") setErrCart(cartErr as string);
      }
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  let productsFiltered = products.filter((obj) => obj.id === itemId);
  let product = productsFiltered.length > 0 ? productsFiltered[0] : null;
  return (
    <>
      {showModal && (
        <ErrorModalContainer
          closeModal={toggleModal}
          show={showModal}
          title={"Error"}
          text={errCart + errSession}
        />
      )}
      <div className="h-[100%] grid place-items-center bg-slate-500">
        {product && (
          <ItemCard
            product={product}
            qtyInCart={qtyInCart}
            key={`Item-card-${product.id}`}
            handleModalAddItem={handleModalAddItem}
            handleModalDecrementItem={handleModalDecrementItem}
          />
        )}
      </div>
    </>
  );
};

export default ItemDetailCardPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  console.log("url:", resolvedUrl);
  const queryString = resolvedUrl.split("/")[2];
  let itemId: string;
  const { data, error } = await client.query({ query: GET_ITEMS });
  let products: Product[] = data.items;
  if (queryString) {
    itemId = queryString;
  } else {
    itemId = "notFound";
  }
  return {
    props: {
      itemId,
      products: products,
      error: error ? error : null,
    },
  };
};
