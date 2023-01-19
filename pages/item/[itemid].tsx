import { GetServerSideProps, NextPage } from "next";
import { products } from "../../utils/sampleData";
import ItemCard from "@/components/itemCard/ItemCard";
import React from "react";

type Product = {
  name: string;
  src: string;
  price: number;
  alt: string;
  quantity: number;
  description: string;
  id: string;
};

interface Props {
  products: [Product];
  itemId: string;
}

const ItemDetailCardPage: NextPage<Props> = ({ products, itemId }) => {
  let productsFiltered = products.filter((obj) => obj.id === itemId);
  let product = productsFiltered.length > 0 ? productsFiltered[0] : null;
  return (
    <div className="h-[100%] grid place-items-center">
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

  if (queryString) {
    itemId = queryString;
  } else {
    itemId = "notFound";
  }

  return { props: { products, itemId } };
};
