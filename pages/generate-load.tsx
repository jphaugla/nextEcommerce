// pages/generate-load.tsx
import { NextPage } from "next";
import { useState, useEffect } from "react";
import useSWR from "swr";

const RUN_ID_KEY = "generateLoadLastRunId";
const SESSIONS_KEY = "generateLoadSessions";
// etc...

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const GenerateLoadPage: NextPage = () => {
  // 1) Don't read localStorage in our initialiser
  const [sessions, setSessions] = useState<number>(5);
  const [orders, setOrders]     = useState<number>(10);
  const [restockInterval, setRestockInterval] = useState<number>(200);
  const [runId, setRunId]       = useState<string | null>(null);
  const [running, setRunning]   = useState(false);

  // 2) On mount, load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return; // guard SSR
    
    const v = window.localStorage.getItem(SESSIONS_KEY);
    if (v) setSessions(Number(v));
    
    const o = window.localStorage.getItem(ORDERS_KEY);
    if (o) setOrders(Number(o));
    
    const r = window.localStorage.getItem(RESTOCK_INTERVAL_KEY);
    if (r) setRestockInterval(Number(r));
    
    const last = window.localStorage.getItem(RUN_ID_KEY);
    if (last) setRunId(last);
  }, []);

  // 3) Persist whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSIONS_KEY, String(sessions));
  }, [sessions]);
  // same for orders & restockInterval

  // 4) Fetch summaries only when runId is set
  const { data: rows, error } = useSWR(
    runId ? `/api/load-summary?runId=${runId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // 5) Rest of your logic...
  //    Make sure nowhere below you do `{ someAsyncFn() }` in JSX!

  return (
    <div className="p-6">
      <h1>Generate Load</h1>
      {/* your form inputs & button */}
      {error && <p className="text-red-500">Error loading summaries.</p>}
      {rows && rows.length > 0 && (
        <table>
          <thead>…</thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.username}>
                <td>{r.username}</td>
                <td>{r.ordersCompleted}</td>
                <td>{new Date(r.startTime).toLocaleString()}</td>
                <td>{new Date(r.endTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

