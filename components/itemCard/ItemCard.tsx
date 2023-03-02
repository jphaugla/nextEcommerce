import React from "react";
import Image from "next/image";
import LeftContainer from "./subcomponents/LeftContainer";
import RightContainer from "./subcomponents/RightContainer";
import { Product } from "../../types/items";
import { ApolloError } from "@apollo/client";

interface Props {
  product: Product;
  handler: () => void;
}

const ItemCard: React.FC<Props> = ({ product, handler }) => {
  return (
    <div className="h-[100%] md:h-[85%] w-[100%] md:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 md:rounded-2xl overflow-y-scroll md:overflow-y-clip scrollbar-hide">
      <LeftContainer product={product} />
      <RightContainer product={product} handler={handler} />
    </div>
  );
};

export default ItemCard;
