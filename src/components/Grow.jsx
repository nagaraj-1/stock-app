import { useEffect, useRef, useState } from "react";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
useEffect(() => {
  const ws = new WebSocket("ws://192.168.200.153:8000/ws");

  ws.onopen = () => {
    console.log("CONNECTED");
    setConnected(true);
  };

  ws.onmessage = (event) => {
    setLogs((prev) => [...prev, event.data]);
  };

  ws.onclose = () => {
    console.log("DISCONNECTED");
    setConnected(false);
  };

  ws.onerror = (err) => {
    console.log("ERROR", err);
  };

  return () => ws.close();
}, []);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
      

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            connected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {connected ? "CONNECTED" : "DISCONNECTED"}
        </div>
      </div>

      {/* LOG SCREEN */}
      <div className="rounded-3xl border border-slate-200 bg-black p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>

          <span className="ml-4 text-sm text-slate-400">
            websocket://127.0.0.1:8000/ws
          </span>
        </div>

        <div className="h-[700px] overflow-y-auto rounded-2xl bg-[#050505] p-4 font-mono text-sm text-green-400">
          {logs.length === 0 ? (
            <div className="animate-pulse text-slate-500">
              Waiting for backend logs...
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="mb-2 break-words border-b border-slate-800 pb-2"
              >
                <span className="mr-3 text-slate-500">
                  [{new Date().toLocaleTimeString()}]
                </span>

                {log.message}
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* TEST BUTTONS */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={async () => {
            await fetch("http://127.0.0.1:8000/test");
          }}
          className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Test Logs
        </button>

        <button
          onClick={async () => {
            await fetch("http://127.0.0.1:8000/orders");
          }}
          className="rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
        >
          Get Orders
        </button>

        <button
          onClick={() => {
            setLogs([]);
          }}
          className="rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}