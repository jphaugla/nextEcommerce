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
    <div className="h-[85%] w-[80%] mx-auto bg-green-300 grid grid-cols-2">
      <div className="h-[100%] col-span-1 flex flex-col bg-blue-400">
        <div className="text-3xl text-center py-3">{product.name}</div>

        <div className="flex grow bg-purple-700">
          <div className="h-[100%] grow"></div>
          <div className="h-[100%] w-[50%] mx-auto grid place-items-center bg-yellow-400">
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

      <div className="col-span-1 flex flex-col">
        <div className="grow">
          <div className="text-2xl underline">About</div>
          <div>{product.description}</div>
          <div className="text-2xl underline">Features</div>

          <div>width: {"blah blah"}</div>
          <div>length: {"blah blah"}</div>
          <div>height: {"blah blah"}</div>
          <div>weight: {"blah blah"}</div>

          <div className="text-2xl underline">Comments</div>
          <div>{"blah blah"}</div>
        </div>

        <div className="h-24 bg-red-400">
          <div>
            Price:
            {product.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
          <div>Items Left: {product.quantity}</div>
          <div>Add to cart</div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
