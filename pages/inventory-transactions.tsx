// pages/inventory-transactions.tsx
import { NextPage, GetServerSideProps } from "next";
import { prisma } from "@/services/prisma-client";

type TransactionRow = {
  id: string;
  inventoryId: string;
  itemName: string;      
  change: number;
  type: string;
  reference: string | null;
  createdAt: string;
};

interface TransactionsPageProps {
  rows: TransactionRow[];
}

export const getServerSideProps: GetServerSideProps<TransactionsPageProps> = async () => {
  const raw = await prisma.inventoryTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      inventory: {
        include: {
          item: {
            select: { name: true },
          },
        },
      },
    },
  });

  const rows: TransactionRow[] = raw.map((tx) => ({
    id:          tx.id,
    inventoryId: tx.inventoryId,
    itemName:    tx.inventory.item.name,
    change:      tx.change,
    type:        tx.type,
    reference:   tx.reference,
    createdAt:   tx.createdAt.toISOString(),
  }));

  return { props: { rows } };
};

const TransactionsPage: NextPage<TransactionsPageProps> = ({ rows }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Inventory Transactions</h1>
    <table className="min-w-full bg-white border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Item</th>
          <th className="border px-4 py-2">Change</th>
          <th className="border px-4 py-2">Type</th>
          <th className="border px-4 py-2">Reference</th>
          <th className="border px-4 py-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="even:bg-white odd:bg-gray-50">
            <td className="border px-4 py-2">{r.id}</td>
            <td className="border px-4 py-2">{r.itemName}</td>
            <td className="border px-4 py-2">{r.change}</td>
            <td className="border px-4 py-2">{r.type}</td>
            <td className="border px-4 py-2">{r.reference}</td>
            <td className="border px-4 py-2">
              {new Date(r.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TransactionsPage;
