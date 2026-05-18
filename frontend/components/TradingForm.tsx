"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  IndianRupee,
  TrendingUp,
  Activity,
  Tag,
  Layout,
  ChevronRight,
} from "lucide-react";
import SelectBox from "./SelectBox";
import PlatformSelect from "./PlatformSelect";
import { users, platforms } from "@/data/constants";
import { API_PREFIX } from "@/config/api";
import { Order } from "@/types/order";
import { SelectedIntradayStock } from "./IntradayStocks";

type TradingFormProps = {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  investmentSettings: Record<string, number>;
  selectedStock?: SelectedIntradayStock | null;
};

export default function TradingForm({
  setOrders,
  investmentSettings,
  selectedStock,
}: TradingFormProps) {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [price, setPrice] = useState(10);
  const [percentage, setPercentage] = useState(16);
  const [selectedUser, setSelectedUser] = useState("NAG");
  const [selectedPlatform, setSelectedPlatform] = useState("Groww");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStock) {
      const timer = window.setTimeout(() => {
        setSymbol(selectedStock.symbol.toUpperCase());
        setPrice(selectedStock.price);
        setPercentage(selectedStock.percentage);
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [selectedStock]);

  
  // ====================================
  // LIVE CALCULATIONS
  // ====================================
  const tradeSummary = useMemo(() => {
    const targetPercentage = 15.51;
    const amount = investmentSettings[`${selectedUser}-${selectedPlatform}`] ?? 0;
    const finalPrice = Number(
  (Math.round(
    (((price / (1 + percentage / 100)) *
      (1 + targetPercentage / 100)) / 0.10)
  ) * 0.10).toFixed(2)
);
    const qty = Math.floor(amount / (finalPrice / 5));

    return { amount, finalPrice, qty, targetPercentage };
  }, [price, percentage, selectedUser, selectedPlatform, investmentSettings]);

  /* =========================
     EXECUTE ORDER
  ========================= */

  const executeOrder = async () => {
    try {
      setLoading(true);

      const { amount, finalPrice, qty, targetPercentage } = tradeSummary;

      const response = await fetch(`${API_PREFIX}/execute-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "BUY",
          symbol,
          qty,
          price: Number(finalPrice.toFixed(2)),
          platform: selectedPlatform,
          user: selectedUser,
        }),
      });

      const data = await response.json();
      const backendOrderId = data.order_id || `ORD-${Math.floor(Math.random() * 999999)}`;
      const now = new Date();

      const order: Order = {
        id: backendOrderId,
        symbol,
        qty,
        price: Number(finalPrice.toFixed(2)),
        finalPrice: Number(finalPrice.toFixed(2)),
        user: selectedUser,
        platform: selectedPlatform,
        amount,
        percentage: Number(targetPercentage.toFixed(2)),
        status: "Executed",
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      };

      setOrders((prev) => [order, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Side: Form */}
          <div className="flex-1 p-6 md:p-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Trade Setup</h2>
            </div>

            <div className="grid gap-8">
              {/* Row 1: Asset Details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Tag className="h-3 w-3" />
                  Asset Details
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">Symbol</label>
                    <input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      onFocus={(e) => e.target.select()}
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-lg font-black text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">Price</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-11 pr-4 text-lg font-black text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">Offset %</label>
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className={`h-14 w-full rounded-2xl border-2 px-5 text-lg font-black outline-none transition-all focus:bg-white ${
                        percentage >= 0
                          ? "border-emerald-100 bg-emerald-50/50 text-emerald-600 focus:border-emerald-500"
                          : "border-red-100 bg-red-50/50 text-red-600 focus:border-red-500"
                      }`}
                    />
                  </div>
                </div>
              </section>

              {/* Row 2: Account Details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Activity className="h-3 w-3" />
                  Execution Source
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectBox label="User" value={selectedUser} options={users} onChange={setSelectedUser} />
                  <PlatformSelect label="Platform" value={selectedPlatform} options={platforms} onChange={setSelectedPlatform} />
                </div>
              </section>
            </div>
          </div>

          {/* Right Side: Summary Card */}
          <div className="w-full lg:w-[380px] bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <Layout className="h-3 w-3" />
                Trade Summary
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-sm font-bold text-slate-500">Budget</div>
                  <div className="text-lg font-black text-slate-900">₹{tradeSummary.amount.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-sm font-bold text-slate-500">Target Price</div>
                  <div className="text-lg font-black text-blue-600">₹{tradeSummary.finalPrice}</div>
                </div>

                <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Buy Quantity</div>
                    <div className="text-4xl font-black">{tradeSummary.qty}</div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-white/5">
                    <TrendingUp className="h-32 w-32" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 border-t border-slate-200 pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={executeOrder}
                disabled={loading}
                className="group relative flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-xl font-black text-white shadow-2xl shadow-blue-500/30 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Execute Order
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Final calculation includes 15.51% brokerage
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
}
