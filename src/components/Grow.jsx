import React, { useEffect, useRef, useState } from "react";

export default function LiveConsole() {
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [logs]);

  const connectWebSocket = () => {
    // CHANGE YOUR DOMAIN
    const ws = new WebSocket("wss://stock.eatoo.in/ws");

    wsRef.current = ws;

    ws.onopen = () => {
      addLog("🟢 Connected to server");
    };

    ws.onmessage = (event) => {
      addLog(event.data);
    };

    ws.onerror = () => {
      addLog("🔴 WebSocket Error");
    };

    ws.onclose = () => {
      addLog("🟡 Disconnected... reconnecting");

      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
  };

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  return (
    <div
      style={{
        background: "#000",
        color: "#00ff00",
        height: "100vh",
        padding: "20px",
        overflowY: "auto",
        fontFamily: "monospace",
      }}
    >
      <h2 style={{ color: "#fff" }}>LIVE PYTHON CONSOLE</h2>

      {logs.map((log, index) => (
        <div
          key={index}
          style={{
            marginBottom: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {log}
        </div>
      ))}

      <div ref={bottomRef}></div>
    </div>
  );
}