// pages/generate-load.tsx

import { GetServerSideProps, NextPage } from "next";
import { prisma } from "@/services/prisma-client";

type RunRow = {
  id: string;
  userEmail: string;
  numSessions: number;
  numOrders: number;
  startTime: string;
  endTime: string | null;
  failed: number;
  cancelled: boolean;
  totalOrdersCompleted: number;
};

interface Props {
  runs: RunRow[];
}

const GenerateLoadPage: NextPage<Props> = ({ runs }) => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Load Run History</h1>
      <p className="text-gray-700">
        New load runs are no longer triggered via the UI.  
        To generate load, run{" "}
        <code className="bg-gray-100 px-2 py-1 rounded">
          npm run load &lt;sessions&gt; &lt;orders&gt; &lt;interval_ms&gt;
        </code>
      </p>

      {runs.length === 0 ? (
        <p className="text-gray-600">No load runs recorded yet.</p>
      ) : (
        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Run ID</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Sessions</th>
              <th className="border px-4 py-2">Orders/Session</th>
              <th className="border px-4 py-2">Started</th>
              <th className="border px-4 py-2">Ended</th>
              <th className="border px-4 py-2">Failed Txns</th>
              <th className="border px-4 py-2">Cancelled?</th>
              <th className="border px-4 py-2">Orders Done</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="even:bg-white odd:bg-gray-50">
                <td className="border px-4 py-2 text-xs font-mono">{run.id}</td>
                <td className="border px-4 py-2">{run.userEmail}</td>
                <td className="border px-4 py-2 text-center">{run.numSessions}</td>
                <td className="border px-4 py-2 text-center">{run.numOrders}</td>
                <td className="border px-4 py-2">
                  {new Date(run.startTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {run.endTime ? new Date(run.endTime).toLocaleString() : "—"}
                </td>
                <td className="border px-4 py-2 text-center">{run.failed}</td>
                <td className="border px-4 py-2 text-center">
                  {run.cancelled ? "Yes" : "No"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {run.totalOrdersCompleted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GenerateLoadPage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const runs = await prisma.loadRun.findMany({
    orderBy: { startTime: "desc" },
    include: { summaries: true },
  });

  const rows: RunRow[] = runs.map((run) => ({
    id: run.id,
    userEmail: run.userEmail,
    numSessions: run.numSessions,
    numOrders: run.numOrders,
    startTime: run.startTime.toISOString(),
    endTime: run.endTime ? run.endTime.toISOString() : null,
    failed: run.failed,
    cancelled: run.cancelled,
    totalOrdersCompleted: run.summaries.reduce((sum, s) => sum + s.ordersCompleted, 0),
  }));

  return { props: { runs: rows } };
};
