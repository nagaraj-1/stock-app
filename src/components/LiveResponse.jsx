import React, { useEffect, useRef, useState } from "react";

export default function LiveResponse() {

  const [messages, setMessages] = useState([]);

  const wsRef = useRef(null);

  const reconnectTimeout = useRef(null);

  // ==========================================
  // WEBSOCKET CONNECT
  // ==========================================

  const connectWebSocket = () => {

    const WS_URL =
      window.location.hostname === "localhost"
        ? "ws://localhost:8000/ws"
        : "wss://stock.eatoo.in/ws";

    const ws = new WebSocket(WS_URL);

    wsRef.current = ws;

    // ==========================================
    // CONNECTED
    // ==========================================

    ws.onopen = () => {

      console.log("WEBSOCKET CONNECTED");

      addMessage("🟢 LIVE SERVER CONNECTED");
    };

    // ==========================================
    // RECEIVE MESSAGE
    // ==========================================

    ws.onmessage = (event) => {

      addMessage(event.data);
    };

    // ==========================================
    // ERROR
    // ==========================================

    ws.onerror = (error) => {

      console.log("WEBSOCKET ERROR", error);

      addMessage("🔴 WEBSOCKET ERROR");
    };

    // ==========================================
    // DISCONNECTED
    // ==========================================

    ws.onclose = () => {

      console.log("WEBSOCKET DISCONNECTED");

      addMessage("🟡 SERVER DISCONNECTED");

      reconnectTimeout.current = setTimeout(() => {

        connectWebSocket();

      }, 3000);
    };
  };

  // ==========================================
  // ADD MESSAGE
  // ==========================================

  const addMessage = (message) => {

    setMessages((prev) => [

      ...prev,

      `[${new Date().toLocaleTimeString()}] ${message}`

    ]);
  };

  // ==========================================
  // START
  // ==========================================

  useEffect(() => {

    connectWebSocket();

    return () => {

      if (wsRef.current) {
        wsRef.current.close();
      }

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };

  }, []);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        background: "#000",
        color: "#00ff00",
        height: "100vh",
        overflowY: "auto",
        padding: "20px",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >

      <h2
        style={{
          color: "#ffffff",
          marginBottom: "20px",
        }}
      >
        LIVE PYTHON LOGS
      </h2>

      {messages.map((msg, index) => (

        <div
          key={index}
          style={{
            marginBottom: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg}
        </div>

      ))}

    </div>
  );
}