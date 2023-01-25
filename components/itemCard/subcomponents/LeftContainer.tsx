import React from "react";
import Image from "next/image";

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

const ImageContainer: React.FC<Props> = ({ product }) => {
  return (
    <div className="h-[100%] w-[50%] md:w-[50%] lg:w-[70%] xl:w-[55%] 2xl:w-[50%] mx-auto grid place-items-center">
      <div className="relative aspect-[2/3] w-full overflow-clip shadow-2xl rounded-md">
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
  );
};

const LeftContainer: React.FC<Props> = ({ product }) => {
  return (
    <div className="h-[100%] col-span-1 flex flex-col">
      <div className="text-3xl text-center py-3 bg-[#0e142d]">
        <h1 className="text-white">{product.name}</h1>
      </div>

      <div className="flex grow    bg-gradient-to-r  from-[#2d365e66] to-[#41455375] ">
        <div className="h-[100%] grow"></div>
        <ImageContainer product={product} />
        <div className="h-[100%] grow"></div>
      </div>
    </div>
  );
};

export default LeftContainer;
