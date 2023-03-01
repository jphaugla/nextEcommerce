import React from "react";
import Image from "next/image";
import { useGetCartByEmail } from "@/utils/hooks/useGetCartByEmail";
import { CartItem } from "@/types/cartItems";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { NextPage } from "next/types";
import type { User } from "next-auth";

interface Props {
  data: User;
}
interface CheckoutProps {
  cartItem: CartItem;
}

const CheckoutItem: React.FC<CheckoutProps> = ({ cartItem }) => {
  return (
    <tr className="w-full flex justify-evenly">
      <td className="px-1 sm:px-2 py-2 sm:whitespace-nowrap w-1/5">
        <div className="grid grid-cols-4 w-full pl-4 items-center justify-start">
          <div className="w-full col-span-1 sm:h-full">
            <Image
              className="rounded-full -z-50"
              src={cartItem.src}
              width="40"
              height="40"
              alt={cartItem.name}
            />
          </div>
          <div className="truncate col-span-3 w-full pl-3 font-medium text-left text-gray-800">
            {cartItem.name}
          </div>
        </div>
      </td>

      <td className="px-1 sm:px-2 py-2 sm:whitespace-nowrap grid place-items-center w-1/5">
        <div className="text-center font-medium grid place-items-center">
          <p>
            {cartItem.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </td>

      <td className="px-1 sm:px-2 py-2 whitespace-nowrap w-1/5 grid place-items-center">
        <div className="flex justify-center text-lg text-center">
          <div className="bg-gray-300 text-gray-600 p-2 rounded-lg flex justify-evenly w-24">
            <div className="w-1/3 font-bold text-lg select-none cursor-pointer">
              -
            </div>
            <div className="w-1/3 font-bold text-lg">{cartItem.quantity}</div>
            <div className="w-1/3 font-bold text-lg select-none cursor-pointer">
              +
            </div>
          </div>
        </div>
      </td>

      <td className="px-1 sm:px-2 py-2 whitespace-nowrap grid place-items-center w-1/5">
        <div className="text-sm sm:text-lg text-center">{cartItem.stock}</div>
      </td>

      <td className="px-1 sm:px-2 py-2 whitespace-nowrap grid place-items-center w-1/5">
        <div className="text-sm font-bold text-red-600 opacity-60 hover:opacity-90 cursor-pointer select-none  text-center">
          <button onClick={() => console.log("hi")}>&#10006;</button>
        </div>
      </td>
    </tr>
  );
};

const CartMessage = () => {
  return (
    <div className="h-17 bg-[#0e142d] p-2">
      <div className="text-md xs:text-lg text-white">Please Note:</div>
      <div className="text-sm xs:text-md text-white">
        Currently we only accommadate in-store pickup at the time
      </div>
    </div>
  );
};

const CartHeader = () => {
  return (
    <div className="h-17 bg-white sm:shadow-lg sm:rounded-sm border border-gray-200  p-2">
      <header className="px-2 sm:px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Cart Summary</h2>
      </header>
    </div>
  );
};

const CartTable = ({ cartItems }: { cartItems: CartItem[] | null }) => {
  return (
    <div className="text-gray-600 grow flex flex-col justify-center">
      <div className="bg-white sm:shadow-lg sm:rounded-sm border border-gray-200 w-full h-full">
        <div className="p-0 sm:p-3 bg-gray-100 h-full">
          <table className="w-full h-full">
            <thead className="text-xs sm:text-sm font-semibold uppercase text-gray-400 grid place-items-center bg-gray-50 w-full h-[10%]">
              <tr className="w-full flex justify-evenly items-center">
                <th className="p-1 sm:whitespace-nowrap w-1/5">
                  <div className="font-semibold text-start pl-2 sm:pl-3">
                    Item
                  </div>
                </th>
                <th className="p-0 sm:p-2 whitespace-nowrap w-1/5">
                  <div className="font-semibold text-center">$/Item</div>
                </th>
                <th className="p-0 sm:p-2 whitespace-nowrap w-1/5">
                  <div className="font-semibold text-center">Qty.</div>
                </th>
                <th className="p-0 sm:p-2 whitespace-nowrap w-1/5">
                  <div className="font-semibold text-center">Stock</div>
                </th>
                <th className="p-1 sm:p-2 whitespace-nowrap w-1/5">
                  <div className="font-semibold text-center">{""}</div>
                </th>
              </tr>
            </thead>

            <tbody className="text-xs md:text-sm overflow-auto scrollbar-hide block w-[100%] h-[90%]">
              {cartItems &&
                cartItems.map((cartItem: CartItem) => (
                  <CheckoutItem key={cartItem.id} cartItem={cartItem} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ cartItems }: { cartItems: CartItem[] | null }) => {
  const numItems = cartItems
    ? cartItems.reduce((acc, cartItem: CartItem) => {
        return acc + Number(cartItem.quantity);
      }, 0)
    : 0;
  const totalCost = cartItems
    ? cartItems.reduce((acc, cartItem: CartItem) => {
        return acc + Number(cartItem.price);
      }, 0)
    : 0;

  return (
    <div className=" bg-[#0e142d] sm:shadow-lg sm:rounded-sm h-17 p-2">
      <div className="px-2 sm:px-5 py-4 grid grid-cols-4">
        <div className="col-span-1 grid place-items-center text-white">
          {`Total Cost: `}
          {totalCost.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </div>
        <div className="col-span-1 text-white grid place-items-center">
          Number of Items: {numItems}
        </div>
        <div className="font-semibold col-span-2  flex justify-end">
          <p className="border-white border-solid border-2 text-white px-4 py-2 rounded-md cursor-pointer">
            Checkout
          </p>
        </div>
      </div>
    </div>
  );
};

const Cart: NextPage<Props> = () => {
  const { error, session, email, cartId, cartItems } = useGetCartByEmail();
  return (
    <div className="h-[100%] bg-slate-600">
      <div className="h-full max-w-5xl mx-auto flex flex-col justify-between">
        <CartMessage />
        <CartHeader />
        <CartTable cartItems={cartItems} />
        <CartSummary cartItems={cartItems} />
      </div>
    </div>
  );
};

export default Cart;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${
          process.env.NODE_ENV === "production"
            ? "https://squarenext.vercel.app/"
            : "http://localhost:3000/"
        }`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      data: session.user ? session.user : null,
    },
  };
};
