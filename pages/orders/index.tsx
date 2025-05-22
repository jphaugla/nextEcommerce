// pages/orders/index.tsx

import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { prisma } from "@/services/prisma-client";

interface OrderSummary {
  id: string;
  createdAt: string;
  totalCents: number;
  status: string;
}

interface Props {
  orders: OrderSummary[];
}

const OrderHistoryPage: NextPage<Props> = ({ orders }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8">Loading your orders…</div>;
  }

  if (!session) {
    return (
      <div className="p-8">
        <p>Please sign in to view your order history.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8">
        <p>You haven’t placed any orders yet.</p>
        <Link href="/" className="mt-2 inline-block text-blue-600 underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl mb-4">Order History</h1>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-4 rounded hover:shadow">
            <Link href={`/orders/${o.id}`} className="block">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{o.id}</p>
                  <p className="text-sm text-gray-600">
                    Placed {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(o.totalCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                  <p className="text-sm">{o.status}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistoryPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      totalCents: true,
      status: true,
    },
  });
  return {
    props: {
      orders: orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
      })),
    },
  };
};
