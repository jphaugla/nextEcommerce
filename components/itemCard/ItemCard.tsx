import React from "react";
import Image from "next/image";
import LeftContainer from "./subcomponents/LeftContainer";
import RightContainer from "./subcomponents/RightContainer";
import { Product } from "../../types/items";
import { ApolloError } from "@apollo/client";

console.log("🐛 ItemCard module loaded"); 

interface Props {
  product: Product;
  qtyInCart: number;
  handleModalAddItem: () => Promise<void>;
  handleModalDecrementItem: () => Promise<void>;
}

const ItemCard: React.FC<Props> = ({
  product,
  qtyInCart,
  handleModalAddItem,
  handleModalDecrementItem,
}) => {
  return (
    <div className="h-[100%] md:h-[85%] w-[100%] md:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 md:rounded-2xl overflow-y-scroll md:overflow-y-clip scrollbar-hide">
      <LeftContainer product={product} />
      <RightContainer
        product={product}
        qtyInCart={qtyInCart}
        handleModalAddItem={handleModalAddItem}
        handleModalDecrementItem={handleModalDecrementItem}
      />
    </div>
  );
};

export default ItemCard;
