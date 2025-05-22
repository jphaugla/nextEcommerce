// pages/orders/[id].tsx

import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { prisma } from "@/services/prisma-client";

interface OrderItem {
  id: string;
  itemId: string;
  quantity: number;
  priceCents: number;
  description: string;
  src: string;
}

interface Props {
  order: {
    id: string;
    createdAt: string;
    totalCents: number;
    status: string;
    items: OrderItem[];
  } | null;
}

const OrderDetailPage: NextPage<Props> = ({ order }) => {
  if (!order) {
    return (
      <div className="p-8">
        <p>Order not found.</p>
        <Link href="/orders" className="text-blue-600 underline">
          Back to history
        </Link>
      </div>
    );
  }

  const total = order.totalCents / 100;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl">Order #{order.id}</h1>
      <p className="text-sm text-gray-600">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>
      <p className="text-sm">Status: {order.status}</p>

      <div className="border-t pt-4 space-y-3">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={it.src}
                alt={it.description}
                width={60}
                height={60}
                className="object-cover rounded"
              />
              <div>
                <p className="font-medium">{it.description}</p>
                <p className="text-sm text-gray-500">
                  Qty: {it.quantity}
                </p>
              </div>
            </div>
            <p className="font-semibold">
              {(it.priceCents * it.quantity / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
        ))}
      </div>

      <div className="text-right font-bold">
        Total: 
        {total.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </div>

      <Link href="/orders" className="text-blue-600 underline">
        ← Back to orders
      </Link>
    </div>
  );
};

export default OrderDetailPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.params as { id: string };
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  return {
    props: {
      order: order
        ? {
            ...order,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map((it) => ({
              ...it,
              priceCents: it.priceCents,
            })),
          }
        : null,
    },
  };
};
