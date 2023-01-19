import { GetServerSideProps, NextPage } from "next";
import { products } from "../../utils/sampleData";
import { useRouter } from "next/router";
import React from "react";

type product = {
  name: string;
  src: string;
  price: number;
  alt: string;
  quantity: number;
  id: string;
};

interface Props {
  products: [product];
}

const ItemDetailCardPage: NextPage<Props> = ({ products }) => {
  return (
    <div>
      {products.map((obj) => (
        <div key={obj.id}>{obj.name}</div>
      ))}
    </div>
  );
};

export default ItemDetailCardPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  return { props: { products } };
};
