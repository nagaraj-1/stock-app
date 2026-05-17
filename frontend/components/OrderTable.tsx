"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock3,
  IndianRupee,
  Terminal,
  Wifi,
  Cpu,
  Activity,
  Trash2,
  PlayCircle,
  Ban,
  TrendingDown,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { API_PREFIX, WS_URL } from "@/config/api";
import { Order } from "@/types/order";

type OrderTableProps = {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
};

export default function OrderTable({
  orders,
  setOrders,
}: OrderTableProps) {

  // ==========================================
  // STATE
  // ==========================================

  const [sellPopup, setSellPopup] =
    useState<Order | null>(null);

  const [sellAmount, setSellAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [immediateSellingId, setImmediateSellingId] =
    useState<string | null>(null);
  const [logs, setLogs] =
    useState<string[]>([]);
  const [message, setMessage] =
    useState<string | null>(null);
  const [messageType, setMessageType] =
    useState<"success" | "error">(
      "success"
    );

  const showMessage = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setMessage(null);
      }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message]);

  useEffect(() => {

    const ws = new WebSocket(WS_URL);
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
  const defaultSellPercentage = 17;
  const [sellPercentage, setSellPercentage] =
    useState(defaultSellPercentage);

  const getDefaultSellPrice = (
    order: Order
  ) => {
    const currentPercentage =
      Number(order.percentage || 0);

    return Number(
      (
        (
          Number(order.price) /
          (1 + currentPercentage / 100)
        ) *
        (
          1 +
          defaultSellPercentage / 100
        )
      ).toFixed(2)
    );
  };

  const openSellPopup = (
    order: Order
  ) => {
    console.log(order.price);

    // Excel Logic:
    // =ROUND((B11 / (1 + (C11 / 100))) * (1 + (C12 / 100)), 2)

    const defaultSellPercentage = 17;

    setSellPercentage(
      defaultSellPercentage
    );

    const amount =
      getDefaultSellPrice(order).toFixed(2);

    setSellAmount(amount);

    setSellPopup(order);
  };


  // ==========================================
  // AI TRACKING
  // ==========================================

  const aiTracking = async (
    order: Order
  ) => {

    try {

      const response = await fetch(
        `${API_PREFIX}/ai-order-tracking`,
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

            user:
              order.user,
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

  const executeSellOrder = async (
    order: Order,
    price: number
  ) => {
    const response = await fetch(
      `${API_PREFIX}/execute-order`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          action: "SELL",

          symbol:
            order.symbol,

          qty:
            order.qty,

          price,

          platform:
            order.platform,

          user:
            order.user,
        }),
      }
    );

    const data =
      await response.json();

    if (
      data.status !== "success"
    ) {
      throw new Error(
        data.message || "Sell Failed"
      );
    }

    return data;
  };

  const sellOrder = async () => {

    if (
      !sellPopup
    ) {
      return;
    }

    try {

      setLoading(true);

      const data =
        await executeSellOrder(
          sellPopup,
          Number(
            sellAmount
          )
        );

      console.log(data);

      showMessage(
        "Sell Order Success",
        "success"
      );

      setSellPopup(null);

    } catch (err) {

      console.log(err);

      showMessage(
        "Sell Failed",
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  const immediateSellOrder = async (
    order: Order
  ) => {

    try {

      setImmediateSellingId(
        order.id
      );

      const targetPrice =
        getDefaultSellPrice(order);

      setSellPercentage(defaultSellPercentage);
      setSellAmount(targetPrice.toFixed(2));

      const data =
        await executeSellOrder(
          order,
          targetPrice
        );

      console.log(data);

      showMessage(
        "Sell Order Success",
        "success"
      );

    } catch (err) {

      console.log(err);

      showMessage(
        "Sell Failed",
        "error"
      );

    } finally {

      setImmediateSellingId(null);
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
        `${API_PREFIX}/stop-tracking`,
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
    platform: string,
    user: string
  ) => {

    try {

      const response = await fetch(
        `${API_PREFIX}/cancel-order`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            order_id: id,
            platform,
            user,
          }),
        }
      );

      const data =
        await response.json();

      if (
        data.status === "success"
      ) {

        setOrders((prev) =>
          prev.map((o) =>
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
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed right-6 top-24 z-50 max-w-xs rounded-3xl border p-4 shadow-2xl ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-500 text-white"
                : "border-rose-200 bg-rose-500 text-white"
            }`}
          >
            <div className="text-sm font-bold">
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              scale: 0.95,
              opacity: 0, y: 20
              }}
            className="w-full max-w-md overflow-hidden rounded-[40px] bg-white shadow-2xl"
            >
            <div className="border-b border-slate-100 p-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Execute Sell</h3>
                  <p className="text-sm font-medium text-slate-500">Configure exit parameters</p>
                </div>
              </div>
              </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asset</span>
                  <div className="text-xl font-black text-slate-900">{sellPopup.symbol}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exit %</span>
                  <input
                    type="number"
                    value={sellPercentage}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSellPercentage(value);
                      const currentPercentage = Number(sellPopup.percentage || 0);
                      const amount = ((Number(sellPopup.price) / (1 + currentPercentage / 100)) * (1 + value / 100)).toFixed(2);
                      setSellAmount(amount);
                    }}
                    className="block w-full bg-transparent text-xl font-black text-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Sell Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-11 pr-4 text-2xl font-black text-slate-900 outline-none transition-all focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSellPopup(null)}
                  className="h-16 flex-1 rounded-2xl font-bold text-slate-400 transition-all hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={sellOrder}
                  disabled={loading}
                  className="h-16 flex-1 rounded-2xl bg-slate-900 font-bold text-white shadow-xl transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Sell"}
                </button>
              </div>
            </div>
          </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
      {/* ===================================== */}
      {/* INTELLIGENCE STREAM */}
      {/* ===================================== */}
      <div className="mb-10 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Intelligence Stream</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
              <Wifi className="h-3 w-3" />
              Live Feed
            </div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </div>
        
        <div className="max-h-[280px] min-h-[120px] overflow-auto bg-slate-900 p-8 font-mono text-[11px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 opacity-20">
              <Cpu className="h-10 w-10 text-white" />
              <span className="font-bold text-white uppercase tracking-widest">Initializing Neural Core...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-4 border-l border-slate-800 pl-4 transition-colors hover:bg-white/5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-blue-400/80 font-bold whitespace-nowrap">SYS.EXE</span>
                  <span className={`${log.includes('Success') ? 'text-emerald-400' : log.includes('Error') ? 'text-red-400' : 'text-slate-300'}`}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* ===================================== */}
      {/* MOBILE VIEW */}
      {/* ===================================== */}

      <div className="space-y-4 lg:hidden">

        <AnimatePresence>

          {orders.map(
            (order) => (

              <motion.div
                key={order.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1, y: 0
                }}
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl"
              >
                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{order.symbol}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{order.id}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${order.status === "Executed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${order.status === "Executed" ? "bg-emerald-500" : "bg-red-500"}`} />
                    {order.status}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value</span>
                    <div className="text-base font-black text-slate-900">₹{order.price.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perf %</span>
                    <div className={`text-base font-black ${Number(order.percentage) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {order.percentage}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execution</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      {order.user} <span className="text-slate-300">/</span> {order.platform}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
                    <div className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-black text-blue-700">
                      {order.qty} Units
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 border-t border-slate-100">
                  <button
                    onClick={() => aiTracking(order)}
                    className="flex flex-col items-center justify-center py-4 text-[10px] font-bold text-violet-500 hover:bg-violet-50"
                  >
                    <PlayCircle className="h-5 w-5 mb-1" />
                    AI
                  </button>
                  <button
                    onClick={() => stopTracking(order.id)}
                    className="flex flex-col items-center justify-center py-4 text-[10px] font-bold text-slate-400 hover:bg-slate-50"
                  >
                    <Ban className="h-5 w-5 mb-1" />
                    Stop
                  </button>
                  <button
                    onClick={() => openSellPopup(order)}
                    className="flex flex-col items-center justify-center py-4 text-[10px] font-bold text-orange-500 hover:bg-orange-50"
                  >
                    <TrendingDown className="h-5 w-5 mb-1" />
                    Sell
                  </button>
                  <button
                    onClick={() => immediateSellOrder(order)}
                    disabled={immediateSellingId === order.id}
                    className="flex flex-col items-center justify-center py-4 text-[10px] font-bold text-amber-600 hover:bg-amber-50 disabled:opacity-30"
                  >
                    <Zap className="h-5 w-5 mb-1" />
                    Sell
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id, order.platform, order.user)}
                    disabled={order.status === "Cancelled"}
                    className="flex flex-col items-center justify-center py-4 text-[10px] font-bold text-red-400 hover:bg-red-50 disabled:opacity-30"
                  >
                    <Trash2 className="h-5 w-5 mb-1" />
                    Del
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
      <div className="hidden overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl lg:block">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                <th className="px-8 py-5">Metadata</th>
                <th className="px-6 py-5">Symbol</th>
                <th className="px-6 py-5">Qty</th>
                <th className="px-6 py-5 text-center">Execution</th>
                <th className="px-6 py-5 text-right">Value</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(
                (order) => (
                  <tr key={order.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{order.id}</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Clock3 className="h-3 w-3" />
                          {order.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-lg font-black text-slate-900">{order.symbol}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-black text-blue-700">
                        {order.qty}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-700">{order.user}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{order.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-slate-900">₹{order.price.toLocaleString()}</span>
                        <span className={`text-[11px] font-black ${Number(order.percentage) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {Number(order.percentage) > 0 ? "+" : ""}{order.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${order.status === "Executed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${order.status === 'Executed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {order.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => aiTracking(order)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors hover:bg-violet-600 hover:text-white"
                          title="AI Tracker"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => stopTracking(order.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                          title="Stop Tracking"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openSellPopup(order)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors hover:bg-orange-600 hover:text-white"
                          title="Execute Sell"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => immediateSellOrder(order)}
                          disabled={immediateSellingId === order.id}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors hover:bg-amber-500 hover:text-white disabled:opacity-30"
                          title="Immediate Sell"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => cancelOrder(order.id, order.platform, order.user)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-600 hover:text-white"
                          title="Cancel Order"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
