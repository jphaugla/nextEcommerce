import React from "react";
import Image from "next/image";

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
  product: Product;
}

const ItemCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="h-[100%] md:h-[85%] w-[100%] md:w-[80%] mx-auto bg-green-300 grid grid-cols-1 md:grid-cols-2  overflow-y-scroll md:overflow-y-clip scrollbar-hide">
      <div className="h-[100%] col-span-1 flex flex-col bg-blue-400">
        <div className="text-3xl text-center py-3">
          <h1>{product.name}</h1>
        </div>

        <div className="flex grow bg-purple-700">
          <div className="h-[100%] grow"></div>
          <div className="h-[100%] w-[50%] md:w-[50%] lg:w-[70%] xl:w-[55%] 2xl:w-[50%] mx-auto grid place-items-center bg-yellow-400">
            <div className="relative aspect-[2/3] w-full overflow-clip">
              <Image
                alt={product.alt}
                src={product.src}
                fill
                sizes="16rem,
        (max-width: 350px) 20rem,
        (max-width: 500px) 13rem,
        (max-width: 640px) 16rem,
        (max-width: 768px) 13rem,
        (max-width: 1024px) 14rem,
        (max-width: 1280px) 14rem"
              />
            </div>
          </div>
          <div className="h-[100%] grow"></div>
        </div>
      </div>

      <div className="col-span-1 flex flex-col-reverse sm:flex-col">
        {/* ############################################# */}
        <div className="grow overflow-y-scroll px-2 md:px-6">
          <h2 className="text-xl underline">About</h2>
          <p className="text-sm">{product.description}</p>
          <h2 className="text-xl underline">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <p className="text-sm col-span-1">width: {"8cm"}</p>
            <p className="text-sm col-span-1">length: {"8cm"}</p>
            <p className="text-sm col-span-1">height: {"15cm"}</p>
            <p className="text-sm col-span-1">weight: {"10oz"}</p>
          </div>

          <h2 className="text-xl underline">Rating</h2>

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
        </div>
        {/* ############################################# */}
        <div className="h-24 bg-red-400">
          <p>
            Price:
            {product.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
          <p>Items Left: {product.quantity}</p>
          <button>Add to cart</button>
        </div>
        {/* ############################################# */}
      </div>
    </div>
  );
};

export default ItemCard;
