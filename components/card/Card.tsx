import Image from "next/image";
import React from "react";
import Link from "next/link";

interface Props {
  name: string;
  alt: string;
  src: string;
  stock: number;
  description: string;
  price: number;
  id: string;
}

const Card: React.FC<Props> = ({
  name,
  alt,
  src,
  stock,
  price,
  id,
  description,
}) => {
  return (
    <Link href={`item/${id}`}>
      <div className=" w-32 xxs:w-40 xs:w-44 sm:w-64 md:w-52 lg:w-56 xl:w-56 aspect-[2/3] bg-slate-200 rounded-2xl hover:ring-4 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[2/3] w-full overflow-clip rounded-t-2xl">
          <Image
            alt={alt}
            src={src}
            fill
            sizes="13rem,
        (max-width: 350px) 13rem,
        (max-width: 500px) 13rem,
        (max-width: 640px) 16rem,
        (max-width: 768px) 13rem,
        (max-width: 1024px) 14rem,
        (max-width: 1280px) 14rem"
          />
        </div>
        <div className="xss:text-base xs:text-lg sm:text-2xl px-2 sm:px-3">
          {name}
        </div>

        <div className="grid grid-cols-5 justify-between px-2 xs:px-2 sm:px-3 pb-2">
          <div className="col-span-3 text-xs sm:text-base">
            Price:{" "}
            {price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>

          <div className="col-span-2">
            <div className="text-right text-xs sm:text-base">Qty: {stock}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
