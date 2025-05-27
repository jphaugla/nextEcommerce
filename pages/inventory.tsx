// pages/inventory.tsx
import { GetServerSideProps, NextPage } from "next";
import { prisma } from "@/services/prisma-client";
import { useRouter } from "next/router";
import { useState } from "react";

type InventoryRow = {
  id: string;
  itemId: string;
  itemName: string;
  onHand: number;
  reserved: number;
  lastAdjustedAt: string;
};

interface InventoryPageProps {
  rows: InventoryRow[];
}

export const getServerSideProps: GetServerSideProps<InventoryPageProps> = async () => {
  const raw = await prisma.inventory.findMany({
    orderBy: { itemId: "asc" },
    include: { item: { select: { name: true } } },
  });
  const rows: InventoryRow[] = raw.map((i) => ({
    id:             i.id,
    itemId:         i.itemId,
    itemName:       i.item.name,
    onHand:         i.onHand,
    reserved:       i.reserved,
    lastAdjustedAt: i.lastAdjustedAt.toISOString(),
  }));
  return { props: { rows } };
};

const InventoryPage: NextPage<InventoryPageProps> = ({ rows }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRestock = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/restock", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restock failed");
      setMessage(data.message);
      // refresh the page data
      router.replace(router.asPath);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={handleRestock}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Restocking…" : "Restock Inventory"}
        </button>
      </div>
      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Item ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">On Hand</th>
            <th className="border px-4 py-2">Reserved</th>
            <th className="border px-4 py-2">Last Adjusted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="even:bg-white odd:bg-gray-50">
              <td className="border px-4 py-2">{r.itemId}</td>
              <td className="border px-4 py-2">{r.itemName}</td>
              <td className="border px-4 py-2">{r.onHand}</td>
              <td className="border px-4 py-2">{r.reserved}</td>
              <td className="border px-4 py-2">
                {new Date(r.lastAdjustedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
