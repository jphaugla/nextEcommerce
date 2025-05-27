// components/itemCard/ItemCard.tsx

import React from "react";
import Image from "next/image";
import LeftContainer from "./subcomponents/LeftContainer";
import RightContainer from "./subcomponents/RightContainer";
import { Product } from "@/types/items";

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
    <div className="h-full md:h-[85%] w-full md:w-4/5 mx-auto grid grid-cols-1 md:grid-cols-2 md:rounded-2xl overflow-hidden">
      {/* Show the product image & title */}
      <LeftContainer product={product} />

      {/* Show description, price, and the +/- buttons */}
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
