import { GetServerSideProps, NextPage } from "next";
import client from "@/services/apollo-client";
import { GET_ITEMS } from "@/utils/gqlQueries/queries";
import { Product } from "@/types/items";
import { ApolloError } from "@apollo/client";
import ItemCard from "@/components/itemCard/ItemCard";
import React from "react";

interface Props {
  products: Product[];
  itemId: string;
  error?: ApolloError;
}

const ItemDetailCardPage: NextPage<Props> = ({ products, itemId }) => {
  let productsFiltered = products.filter((obj) => obj.id === itemId);
  let product = productsFiltered.length > 0 ? productsFiltered[0] : null;
  return (
    <div className="h-[100%] grid place-items-center bg-slate-500">
      {product && <ItemCard product={product} />}
    </div>
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
