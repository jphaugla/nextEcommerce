// pages/index.tsx

import { GetServerSideProps, NextPage } from "next";
import { prisma } from "@/services/prisma-client";
import Link from "next/link";
import { Product } from "@/types/items";

interface Props {
  products: Product[];
}

const HomePage: NextPage<Props> = ({ products }) => {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/item/${p.id}`}
          className="block border rounded-lg overflow-hidden hover:shadow-lg"
        >
          <img
            src={p.src}
            alt={p.alt}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="font-bold text-lg">{p.name}</h2>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p className="mt-2 font-semibold">${p.price.toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const products = await prisma.item.findMany({
    where: { isOriginal: true },
    orderBy: { name: "asc" },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
