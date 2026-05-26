import React, { useEffect, useRef, useState } from "react";
import { Terminal, ShieldAlert, Radio } from "lucide-react";

export default function LiveResponse({ user = "ALL" }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected"); // connected, disconnected, error
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
 

  const connectWebSocket = () => {
    const WS_URL = user === "NAG" ? "wss://stock.eatoo.in/api/ws" : "wss://stock1.eatoo.in/api/ws";
      
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;


    ws.onopen = () => {
      setStatus("connected");
      addSystemMessage("SYSTEM: SOCKET STREAM ESTABLISHED");
    };

    ws.onmessage = (event) => {
      const data = event.data;
      
      // Smart Filter: Only keep logs matching this user context 
      // (Or keep all if no explicit user logs logic is configured upstream)
      if (data.includes(user) || user === "ALL" || !data.includes("user=")) {
        addMessage(data);
      }
    };

    ws.onerror = (error) => {
      setStatus("error");
      addSystemMessage("ERROR: CONNECTION FAULT DETECTED");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      addSystemMessage("SYSTEM: STREAM DISCONNECTED");
      
      reconnectTimeout.current = setTimeout(() => {
        addSystemMessage("SYSTEM: ATTEMPTING RECONNECT...");
        connectWebSocket();
      }, 4000);
    };
  };

  const addMessage = (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), time: timestamp, type: "log", text }]);
  };

  const addSystemMessage = (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), time: timestamp, type: "system", text }]);
  };


    const clearLogs = () => {
  setMessages([]);
};

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [user]);

  // Status pills configuration
  const statusConfig = {
    connected: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "LIVE" },
    disconnected: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "RECONNECTING" },
    error: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", label: "ERROR" },
  };

  return (
    <div className="flex flex-col h-[350px] w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs selection:bg-indigo-500/30">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-indigo-400" />
          <h3 className="font-bold tracking-wide text-slate-200 uppercase">
            {user} Console Logs
          </h3>
        </div>

        {/* Dynamic Connection Status Tag */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${statusConfig[status].bg} ${statusConfig[status].text} ${statusConfig[status].border}`}>
          <Radio size={10} className={status === "connected" ? "animate-pulse" : ""} />
          {statusConfig[status].label}
        </div>
      </div>

      {/* Terminal Feed Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      
        {messages.map((msg) => (
          <div key={msg.id} className="leading-relaxed flex items-start gap-2 group">
            {/* Timestamp */}
            <span className="text-slate-600 select-none shrink-0 font-medium">
              [{msg.time}]
            </span>

            {/* Custom Log Coloring Based on Event Type */}
            {msg.type === "system" ? (
              <span className="text-indigo-400 font-semibold tracking-wide">
                {msg.text}
              </span>
            ) : msg.text.toLowerCase().includes("error") || msg.text.toLowerCase().includes("fail") ? (
              <span className="text-rose-400 flex items-center gap-1 bg-rose-500/5 px-1 rounded">
                <ShieldAlert size={12} className="shrink-0" />
                {msg.text}
              </span>
            ) : msg.text.toLowerCase().includes("success") || msg.text.toLowerCase().includes("executed") ? (
              <span className="text-emerald-400 font-medium">
                {msg.text}
              </span>
            ) : (
              <span className="text-slate-300 group-hover:text-white transition-colors">
                {msg.text}
              </span>
            )}
          </div>
        ))}
      
       
      </div>
      <div className="flex items-center gap-2">
  <button
    onClick={clearLogs}
    className="px-2 py-1 text-[10px] rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
  >
    CLEAR
  </button>

  <div
    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${statusConfig[status].bg} ${statusConfig[status].text} ${statusConfig[status].border}`}
  >
    <Radio
      size={10}
      className={status === "connected" ? "animate-pulse" : ""}
    />
    {statusConfig[status].label}
  </div>
</div>
    </div>
  );
}