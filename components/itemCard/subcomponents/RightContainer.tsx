// components/itemCard/subcomponents/RightContainer.tsx

import React from "react";
import { Product } from "@/types/items";

interface Props {
  product: Product;
  qtyInCart: number;
  handleModalAddItem: () => Promise<void>;
  handleModalDecrementItem: () => Promise<void>;
}

// Log once when module loads
console.log("🔍 RightContainer module loaded");

const Rating: React.FC = () => (
  <div className="flex items-center">
    {/* ...your star SVGs as before... */}
  </div>
);

const RightContainer: React.FC<Props> = ({
  product,
  qtyInCart,
  handleModalAddItem,
  handleModalDecrementItem,
}) => {
  // Log on every render
  console.log("🔍 RightContainer render, qtyInCart =", qtyInCart);

  return (
    <div className="col-span-1 flex flex-col-reverse sm:flex-col">
      <div className="grow overflow-y-scroll scrollbar-hide bg-[#2d3148] text-white flex flex-col gap-[24px]">
        <div className="h-[60px] hidden sm:block bg-[#0e142d]" />
        <div className="px-2 md:px-6">
          <h2 className="text-xl underline mb-[8px]">About</h2>
          <p className="text-sm">{product.description}</p>
        </div>
        <div className="px-2 md:px-6">
          <h2 className="text-xl underline mb-[8px]">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 w-2/3">
            <p className="text-sm col-span-1">width: {product.width}cm</p>
            <p className="text-sm col-span-1">length: {product.length}cm</p>
            <p className="text-sm col-span-1">height: {product.height}cm</p>
            <p className="text-sm col-span-1">weight: {product.weight}oz</p>
          </div>
        </div>
        <div className="px-2 md:px-6 mb-[24px]">
          <h2 className="text-xl underline mb-[8px]">Rating</h2>
          <Rating />
        </div>
      </div>

      <PriceContainer
        product={product}
        qtyInCart={qtyInCart}
        handleModalAddItem={handleModalAddItem}
        handleModalDecrementItem={handleModalDecrementItem}
      />
    </div>
  );
};

const PriceContainer: React.FC<Props> = ({
  product,
  qtyInCart,
  handleModalAddItem,
  handleModalDecrementItem,
}) => {
  // Log on every render
  console.log("🔍 PriceContainer render, qtyInCart =", qtyInCart);

  const price = product.price;

  return (
    <div className="h-24 bg-[#0e142d] text-white px-2 md:px-6 grid grid-cols-2">
      <div className="col-span-1 grid items-center pl-4">
        <div>
          <p className="text-3xl">
            {price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
          <p>Left in Stock: {product.stock}</p>
        </div>
      </div>

      <div className="grid place-items-center col-span-1">
        <div className="bg-gray-300 text-gray-600 px-2 py-3 rounded-lg flex justify-evenly w-24">
          <button
            type="button"
            className="w-1/3 font-bold text-lg select-none cursor-pointer text-center"
            onClick={() => {
              console.log("🔔 PriceContainer − clicked, qtyInCart =", qtyInCart);
              handleModalDecrementItem();
            }}
          >
            −
          </button>
          <div className="w-1/3 font-bold text-lg text-center">{qtyInCart}</div>
          <button
            type="button"
            className="w-1/3 font-bold text-lg select-none cursor-pointer text-center"
            onClick={() => {
              console.log("🔔 PriceContainer + clicked, qtyInCart =", qtyInCart);
              handleModalAddItem();
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightContainer;

