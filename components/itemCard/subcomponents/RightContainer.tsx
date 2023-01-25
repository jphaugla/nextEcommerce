import React from "react";

type Product = {
  name: string;
  src: string;
  price: number;
  alt: string;
  stock: number;
  description: string;
  id: string;
};

interface Props {
  product: Product;
}

const Rating = () => {
  return (
    <div className="flex items-center">
      <svg
        aria-hidden="true"
        className="w-5 h-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>First star</title>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <svg
        aria-hidden="true"
        className="w-5 h-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Second star</title>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <svg
        aria-hidden="true"
        className="w-5 h-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Third star</title>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <svg
        aria-hidden="true"
        className="w-5 h-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Fourth star</title>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <svg
        aria-hidden="true"
        className="w-5 h-5 text-gray-300 dark:text-gray-500"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Fifth star</title>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        4.95 out of 5
      </p>
    </div>
  );
};

const PriceContainer: React.FC<Props> = ({ product }) => {
  return (
    <div className="h-24 bg-[#0e142d] text-white px-2 md:px-6 grid grid-cols-2">
      <div className="col-span-1 grid items-center pl-4">
        <div>
          <p className="text-3xl">
            {product.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
          <p>Left in Stock: {product.stock}</p>
        </div>
      </div>

      <div className="grid place-items-center col-span-1">
        <div className="bg-[#11111] border-solid border-2 border-white py-2 xxs:py-4 px-5 xxs:px-10 cursor-pointer rounded-lg">
          Add to cart
        </div>
      </div>
    </div>
  );
};

const RightContainer: React.FC<Props> = ({ product }) => {
  return (
    <div className="col-span-1 flex flex-col-reverse sm:flex-col">
      <div className="grow overflow-y-scroll scrollbar-hide bg-[#2d3148] text-white flex flex-col gap-[24px]">
        <div className="h-[60px] hidden sm:block bg-[#0e142d]"></div>
        <div className="px-2 md:px-6">
          <h2 className="text-xl underline mb-[8px]">About</h2>
          <p className="text-sm">{product.description}</p>
        </div>
        <div className="px-2 md:px-6">
          <h2 className="text-xl underline mb-[8px]">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 w-2/3">
            <p className="text-sm col-span-1">width: {"8cm"}</p>
            <p className="text-sm col-span-1">length: {"8cm"}</p>
            <p className="text-sm col-span-1">height: {"15cm"}</p>
            <p className="text-sm col-span-1">weight: {"10oz"}</p>
          </div>
        </div>
        <div className="px-2 md:px-6 mb-[24px]">
          <h2 className="text-xl underline mb-[8px]">Rating</h2>
          <Rating />
        </div>
      </div>

      <PriceContainer product={product} />
    </div>
  );
};

export default RightContainer;
