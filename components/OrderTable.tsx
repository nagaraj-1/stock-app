"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Clock3,
  Package2,
  IndianRupee,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

export default function OrderTable({
  orders,
  setOrders,
}: any) {

  // ==========================================
  // STATE
  // ==========================================

  const [sellPopup, setSellPopup] =
    useState<any>(null);

  const [sellAmount, setSellAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [logs, setLogs] =
    useState<string[]>([]);

  useEffect(() => {

    const ws = new WebSocket(
      "ws://127.0.0.1:8000/ws"
    );
    ws.onmessage = (event) => {

      console.log(
        "LIVE LOG:",
        event.data
      );

      setLogs((prev) => [
        event.data,
        ...prev,
      ]);
    };

    ws.onopen = () => {

      console.log(
        "WebSocket Connected"
      );
    };

    ws.onerror = (error) => {

      console.log(
        "WebSocket Error",
        error
      );
    };

    return () => {

      ws.close();
    };

  }, []);
  // ==========================================
  // OPEN SELL POPUP
  // ==========================================
  const [sellPercentage, setSellPercentage] =
    useState(17);

  const openSellPopup = (
    order: any
  ) => {
    console.log(order.price);

    // Excel Logic:
    // =ROUND((B11 / (1 + (C11 / 100))) * (1 + (C12 / 100)), 2)

    const currentPercentage =
      Number(order.percentage || 0);

    const defaultSellPercentage = 17;

    setSellPercentage(
      defaultSellPercentage
    );

    const amount = (
      (
        Number(order.price) /
        (1 + currentPercentage / 100)
      ) *
      (
        1 +
        defaultSellPercentage / 100
      )
    ).toFixed(2);

    setSellAmount(amount);

    setSellPopup(order);
  };


  // ==========================================
  // AI TRACKING
  // ==========================================

  const aiTracking = async (
    order: any
  ) => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/ai-order-tracking",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            symbol:
              order.symbol,

            qty:
              order.qty,

            price:
              order.price,

            order_id:
              order.id,

            platform:
              order.platform,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);


    } catch (error) {

      console.log(error);

      alert(
        "AI Tracking Failed"
      );
    }
  };

  // ==========================================
  // SELL ORDER
  // ==========================================

  const sellOrder = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/execute-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "SELL",

            symbol:
              sellPopup.symbol,

            qty:
              sellPopup.qty,

            price: Number(
              sellAmount
            ),

            platform:
              sellPopup.platform,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Sell Order Success"
      );

      setSellPopup(null);

    } catch (err) {

      console.log(err);

      alert("Sell Failed");

    } finally {

      setLoading(false);
    }
  };

  // ==========================================
  // CANCEL ORDER
  // ==========================================
  const stopTracking = async (
    orderId: string
  ) => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/stop-tracking",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            order_id: orderId,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Tracking Stopped"
      );

    } catch (error) {

      console.log(error);
    }
  };

  const cancelOrder = async (
    id: string,
    platform: string
  ) => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/cancel-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            order_id: id,
            platform,
          }),
        }
      );

      const data =
        await response.json();

      if (
        data.status === "success"
      ) {

        setOrders((prev: any) =>
          prev.map((o: any) =>
            o.id === id
              ? {
                ...o,
                status:
                  "Cancelled",
              }
              : o
          )
        );
      }

    } catch (error) {

      console.error(error);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mt-8">

      {/* ===================================== */}
      {/* SELL POPUP */}
      {/* ===================================== */}

      <AnimatePresence>

        {sellPopup && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >

            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="text-3xl font-black text-slate-900">
                    Sell Order
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Confirm sell execution
                  </div>

                </div>

              </div>

              {/* SYMBOL */}

              <div className="mt-6 rounded-2xl bg-slate-100 p-4">

                <div className="text-xs text-slate-400">
                  Symbol
                </div>

                <div className="mt-1 text-xl font-black">
                  {sellPopup.symbol}
                </div>

              </div>

              {/* INPUT */}

              <div className="mt-5">

                <div className="mb-2 text-sm font-semibold text-slate-600">
                  Sell Amount
                </div>

                {/* SELL PERCENTAGE */}

                <div className="mt-5">

                  <div className="mb-2 text-sm font-semibold text-slate-600">
                    Sell Percentage
                  </div>

                  <input
                    type="number"
                    value={sellPercentage}
                    onChange={(e) => {

                      const value =
                        Number(e.target.value);

                      setSellPercentage(value);

                      const currentPercentage =
                        Number(
                          sellPopup.percentage || 0
                        );

                      const amount = (
                        (
                          Number(sellPopup.price) /
                          (
                            1 +
                            currentPercentage / 100
                          )
                        ) *
                        (
                          1 +
                          value / 100
                        )
                      ).toFixed(2);

                      setSellAmount(amount);
                    }}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-lg font-bold outline-none transition-all focus:border-blue-500"
                  />

                </div>

                <div className="relative">

                  <IndianRupee className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) =>
                      setSellAmount(
                        e.target.value
                      )
                    }
                    onFocus={(e) =>
                      e.target.select()
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-lg font-bold outline-none transition-all focus:border-blue-500"
                  />

                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Default auto calculated 17.3%
                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex gap-3">

                <button
                  onClick={() =>
                    setSellPopup(null)
                  }
                  className="h-14 flex-1 rounded-2xl bg-slate-200 font-bold text-slate-700 transition-all hover:bg-slate-300"
                >
                  Cancel
                </button>

                <button
                  onClick={sellOrder}
                  disabled={loading}
                  className="h-14 flex-1 rounded-2xl bg-red-500 font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >

                  {loading
                    ? "Processing..."
                    : "Confirm Sell"}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
      {/* ===================================== */}
      {/* LIVE CONSOLE */}
      {/* ===================================== */}



      {/* ===================================== */}
      {/* MOBILE VIEW */}
      {/* ===================================== */}

      <div className="space-y-4 lg:hidden">

        <AnimatePresence>

          {orders.map(
            (order: any) => (

              <motion.div
                key={order.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-3xl border border-white/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl"
              >

                {/* TOP */}

                <div className="flex items-start justify-between">

                  <div>

                    <div className="text-lg font-black text-slate-900">
                      {order.symbol}
                    </div>

                    <div className="mt-1 font-mono text-xs text-slate-500">
                      {order.id}
                    </div>

                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold ${order.status ===
                      "Executed"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                      }`}
                  >

                    {order.status}

                  </div>

                </div>

                {/* GRID */}

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div>

                    <div className="text-xs text-slate-400">
                      Qty
                    </div>

                    <div className="mt-1 flex items-center gap-2 font-bold text-blue-600">

                      <Package2 className="h-4 w-4" />

                      {order.qty}

                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      Amount
                    </div>

                    <div className="mt-1 font-bold">
                      ₹{order.price}
                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      User
                    </div>

                    <div className="mt-1 font-semibold">
                      {order.user}
                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      Platform
                    </div>

                    <div className="mt-1 font-semibold">
                      {order.platform}
                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      %
                    </div>

                    <div
                      className={`mt-1 font-bold ${Number(
                        order.percentage
                      ) >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                        }`}
                    >

                      {order.percentage}%

                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      Time
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm">

                      <Clock3 className="h-4 w-4" />

                      {order.time}

                    </div>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="mt-5 grid grid-cols-4 gap-2">

                  {/* AI MODE */}

                  <button
                    onClick={() =>
                      aiTracking(order)
                    }
                    className="h-12 rounded-2xl bg-violet-600 text-xs font-bold text-white transition-all hover:bg-violet-700"
                  >
                    AI Mode
                  </button>
                  <button
                    onClick={() =>
                      stopTracking(
                        order.id
                      )
                    }
                    className="h-12 rounded-2xl bg-black text-xs font-bold text-white"
                  >
                    Stop
                  </button>

                  {/* SELL */}

                  <button
                    onClick={() =>
                      openSellPopup(order)
                    }
                    className="h-12 rounded-2xl bg-orange-500 text-xs font-bold text-white transition-all hover:bg-orange-600"
                  >
                    Sell
                  </button>

                  {/* CANCEL */}

                  <button
                    onClick={() =>
                      cancelOrder(
                        order.id,
                        order.platform
                      )
                    }
                    disabled={
                      order.status ===
                      "Cancelled"
                    }
                    className={`h-12 rounded-2xl text-xs font-bold transition-all ${order.status ===
                      "Cancelled"
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "bg-red-50 text-red-500 hover:bg-red-100"
                      }`}
                  >

                    {order.status ===
                      "Cancelled"
                      ? "Cancelled"
                      : "Cancel"}

                  </button>

                </div>

              </motion.div>
            )
          )}

        </AnimatePresence>

      </div>

      {/* ===================================== */}
      {/* DESKTOP TABLE */}
      {/* ===================================== */}

      <div className="hidden overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-2xl backdrop-blur-xl lg:block">

        <div className="max-h-[700px] overflow-auto">

          <table className="w-full">

            <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl">

              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-500">

                <th className="px-6 py-5">
                  Order ID
                </th>

                <th className="px-6 py-5">
                  Symbol
                </th>

                <th className="px-6 py-5">
                  Qty
                </th>

                <th className="px-6 py-5">
                  User
                </th>

                <th className="px-6 py-5">
                  Platform
                </th>

                <th className="px-6 py-5">
                  Amount
                </th>

                <th className="px-6 py-5">
                  %
                </th>

                <th className="px-6 py-5">
                  Time
                </th>

                <th className="px-6 py-5">
                  Status
                </th>

                <th className="px-6 py-5">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map(
                (order: any) => (

                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-mono text-sm font-bold">
                      {order.id}
                    </td>

                    <td className="px-6 py-5 font-bold">
                      {order.symbol}
                    </td>

                    <td className="px-6 py-5">
                      {order.qty}
                    </td>

                    <td className="px-6 py-5">
                      {order.user}
                    </td>

                    <td className="px-6 py-5">
                      {order.platform}
                    </td>

                    <td className="px-6 py-5 font-bold">
                      ₹{order.price}
                    </td>

                    <td
                      className={`px-6 py-5 font-bold ${Number(
                        order.percentage
                      ) >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                        }`}
                    >

                      {order.percentage}%

                    </td>

                    <td className="px-6 py-5">
                      {order.time}
                    </td>

                    <td className="px-6 py-5">

                      <div
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${order.status ===
                          "Executed"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                          }`}
                      >

                        {order.status}

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex gap-2">

                        {/* AI MODE */}

                        <button
                          onClick={() =>
                            aiTracking(order)
                          }
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-violet-700"
                        >
                          AI Mode
                        </button>

                        <button
                          onClick={() =>
                            stopTracking(
                              order.id
                            )
                          }
                          className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white"
                        >
                          Stop
                        </button>

                        {/* SELL */}

                        <button
                          onClick={() =>
                            openSellPopup(order)
                          }
                          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-600"
                        >
                          Sell
                        </button>

                        {/* CANCEL */}

                        <button
                          onClick={() =>
                            cancelOrder(
                              order.id,
                              order.platform
                            )
                          }
                          disabled={
                            order.status ===
                            "Cancelled"
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${order.status ===
                            "Cancelled"
                            ? "cursor-not-allowed bg-slate-200 text-slate-400"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
                            }`}
                        >

                          Cancel

                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>



        </div>



      </div>
      <div className="mb-6 rounded-[32px] bg-black p-5 shadow-2xl">

        <div className="mb-4 flex items-center justify-between">

          <div className="text-lg font-black text-white">
            Live Console
          </div>

          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

        </div>

        <div className="max-h-[350px] overflow-auto rounded-2xl bg-black/40 p-4 font-mono text-xs text-green-400">

          {logs.length === 0 ? (

            <div className="text-slate-500">
              Waiting for logs...
            </div>

          ) : (

            logs.map(
              (log, index) => (

                <div
                  key={index}
                  className="mb-1"
                >
                  {log}
                </div>

              )
            )

          )}

        </div>

      </div>
    </div>
  );
}