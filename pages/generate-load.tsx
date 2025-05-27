// pages/generate-load.tsx
import { NextPage } from "next";
import { useState, useEffect } from "react";
import useSWR from "swr";

type Summary = {
  username: string;
  ordersCompleted: number;
  startTime: string;
  endTime: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RUN_ID_KEY            = "generateLoadLastRunId";
const SESSIONS_KEY          = "generateLoadSessions";
const ORDERS_KEY            = "generateLoadOrders";
const RESTOCK_INTERVAL_KEY  = "generateLoadRestockInterval";

const GenerateLoadPage: NextPage = () => {
  // 1) Load persisted params or use defaults
  const [sessions, setSessions] = useState(() => {
    const v = localStorage.getItem(SESSIONS_KEY);
    return v ? Number(v) : 5;
  });
  const [orders, setOrders] = useState(() => {
    const v = localStorage.getItem(ORDERS_KEY);
    return v ? Number(v) : 10;
  });
  const [restockInterval, setRestockInterval] = useState(() => {
    const v = localStorage.getItem(RESTOCK_INTERVAL_KEY);
    return v ? Number(v) : 200;
  });

  const [runId, setRunId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // 2) On mount, rehydrate runId
  useEffect(() => {
    const storedRunId = localStorage.getItem(RUN_ID_KEY);
    if (storedRunId) {
      setRunId(storedRunId);
    }
  }, []);

  // 3) Persist each param whenever it changes
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, String(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, String(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(RESTOCK_INTERVAL_KEY, String(restockInterval));
  }, [restockInterval]);

  // 4) Fetch summaries for the current (or last) run
  const { data: rows, error } = useSWR<Summary[]>(
    runId ? `/api/load-summary?runId=${runId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // 5) Stop the “Running” state once all sessions report in
  useEffect(() => {
    if (running && rows && rows.length === sessions) {
      setRunning(false);
    }
  }, [running, rows, sessions]);

  // 6) Kick off a new load run
  const handleRun = async () => {
    setRunning(true);
    setRunId(null); // hide old summary while starting

    const res = await fetch(
      `/api/generate-load?user=${encodeURIComponent("admin@cockroachlabs.com")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numSessions:     sessions,
          numOrders:       orders,
          restockInterval, 
        }),
      }
    );

    if (!res.ok) {
      console.error("Failed to start load:", await res.text());
      setRunning(false);
      return;
    }
    const { runId: newRunId } = await res.json();
    localStorage.setItem(RUN_ID_KEY, newRunId);
    setRunId(newRunId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Generate Load</h1>

      <div className="flex space-x-4 mb-6">
        <label>
          Sessions:
          <input
            type="number"
            min={1}
            value={sessions}
            onChange={(e) => setSessions(+e.target.value)}
            className="ml-2 border px-2 py-1"
          />
        </label>

        <label>
          Orders per Session:
          <input
            type="number"
            min={1}
            value={orders}
            onChange={(e) => setOrders(+e.target.value)}
            className="ml-2 border px-2 py-1"
          />
        </label>

        <label>
          Restock Interval:
          <input
            type="number"
            min={1}
            value={restockInterval}
            onChange={(e) => setRestockInterval(+e.target.value)}
            className="ml-2 border px-2 py-1"
          />
        </label>

        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {running ? "Running…" : "Start Load"}
        </button>
      </div>

      {error && <p className="text-red-500">Error loading summaries.</p>}

      {rows && rows.length > 0 && (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Orders Completed</th>
              <th className="border px-4 py-2">Start Time</th>
              <th className="border px-4 py-2">End Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.username}>
                <td className="border px-4 py-2">{r.username}</td>
                <td className="border px-4 py-2">{r.ordersCompleted}</td>
                <td className="border px-4 py-2">
                  {new Date(r.startTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(r.endTime).toLocaleString()}
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
