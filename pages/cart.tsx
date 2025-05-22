// pages/cart.tsx

import React, { useEffect, useState } from "react";
import { NextPage, GetServerSideProps } from "next";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import client from "@/services/apollo-client";
import { GET_ITEMS } from "@/utils/gqlQueries/queries";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { Product } from "@/types/items";

interface CartPageProps {
  products: Product[];
}

interface CartItemWithProduct {
  id: string;
  itemId: string;
  quantity: number;
  product?: Product;
}

const CheckoutItem: React.FC<{ item: CartItemWithProduct }> = ({ item }) => {
  const { product, quantity } = item;
  const price = product?.price ?? 0;
  return (
    <div className="flex justify-between p-4 border-b">
      <div>
        <p className="font-medium">{product?.name ?? "Unknown item"}</p>
        <p className="text-sm text-gray-600">
          {(product?.description ?? "").slice(0, 50)}
        </p>
      </div>
      <div className="text-right">
        <p>
          {price.toLocaleString("en-US", { style: "currency", currency: "USD" })} ×{" "}
          {quantity}
        </p>
        <p className="font-semibold">
          {(price * quantity).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </p>
      </div>
    </div>
  );
};

const CartPage: NextPage<CartPageProps> = ({ products }) => {
  const { data: session, status } = useSession();
  const { cartItems, loading: cartLoading } = useGetCartByEmail();
  const [itemsWithProduct, setItemsWithProduct] = useState<CartItemWithProduct[]>([]);

  // Merge product data when cartItems arrive
  useEffect(() => {
    if (status === "authenticated" && cartItems) {
      setItemsWithProduct(
        cartItems.map((ci) => ({
          ...ci,
          product: products.find((p) => p.id === ci.itemId),
        }))
      );
    }
  }, [status, cartItems, products]);

  if (status === "loading" || cartLoading) {
    return <div className="p-8">Loading your cart…</div>;
  }

  if (!session) {
    return (
      <div className="p-8">
        <p>Please sign in to view your cart.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

if (itemsWithProduct.length === 0) {
  return (
    <div className="p-8">
      <p>Your cart is empty.</p>
      <Link
        href="/"
        className="mt-2 inline-block text-blue-600 underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}


  const total = itemsWithProduct.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Your Cart</h1>
      {itemsWithProduct.map((item) => (
        <CheckoutItem key={item.id} item={item} />
      ))}
      <div className="text-right mt-6 font-bold">
        Total:{" "}
        {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </div>
    </div>
  );
};

export default CartPage;

// We only need products on the server
export const getServerSideProps: GetServerSideProps<CartPageProps> = async () => {
  const { data } = await client.query({ query: GET_ITEMS });
  return {
    props: {
      products: data.items,
    },
  };
};
