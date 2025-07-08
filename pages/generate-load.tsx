import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import useSWR from "swr";

type Summary = {
  username: string;
  ordersCompleted: number;
  startTime: string;
  endTime: string;
};

const RUN_ID_KEY           = "generateLoadLastRunId";
const SESSIONS_KEY         = "generateLoadSessions";
const ORDERS_KEY           = "generateLoadOrders";
const RESTOCK_INTERVAL_KEY = "generateLoadRestockInterval";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const GenerateLoadPage: NextPage = () => {
  const [sessions, setSessions]               = useState<number>(5);
  const [orders, setOrders]                   = useState<number>(10);
  const [restockInterval, setRestockInterval] = useState<number>(200);
  const [runId, setRunId]                     = useState<string | null>(null);
  const [running, setRunning]                 = useState<boolean>(false);

  // On mount, hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(SESSIONS_KEY);
    if (v) setSessions(Number(v));
    const o = window.localStorage.getItem(ORDERS_KEY);
    if (o) setOrders(Number(o));
    const r = window.localStorage.getItem(RESTOCK_INTERVAL_KEY);
    if (r) setRestockInterval(Number(r));
    const last = window.localStorage.getItem(RUN_ID_KEY);
    if (last) setRunId(last);
  }, []);

  // Persist params
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSIONS_KEY, String(sessions));
  }, [sessions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ORDERS_KEY, String(orders));
  }, [orders]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RESTOCK_INTERVAL_KEY, String(restockInterval));
  }, [restockInterval]);

  // Fetch summaries
  const { data: rows, error } = useSWR<Summary[]>(
    runId ? `/api/load-summary?runId=${runId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // When all sessions are back, stop the running state
  useEffect(() => {
    if (running && rows && rows.length === sessions) {
      setRunning(false);
    }
  }, [running, rows, sessions]);

  // Kick off load
  const handleRun = async () => {
    setRunning(true);
    setRunId(null);
    const res = await fetch(
      `/api/generate-load?user=${encodeURIComponent("admin@cockroachlabs.com")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numSessions: sessions,
          numOrders: orders,
          restockInterval,
        }),
      }
    );

    if (!res.ok) {
      console.error("Failed to start load:", await res.text());
      setRunning(false);
      return;
    }

    const { runId: newRun } = await res.json();
    window.localStorage.setItem(RUN_ID_KEY, newRun);
    setRunId(newRun);
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
