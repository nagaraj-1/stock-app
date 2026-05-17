"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type PlaywrightRow = string[];

type TradingFormProps = {
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  investmentSettings: Record<string, number>;
};

export default function TradingForm({
  setOrders,
  investmentSettings,
}: TradingFormProps) {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [price, setPrice] = useState(10);
  const [percentage, setPercentage] = useState(16);
  const [selectedUser, setSelectedUser] = useState("NAG");
  const [selectedPlatform, setSelectedPlatform] = useState("Groww");
  const [loading, setLoading] = useState(false);
  const [showScriptPopup, setShowScriptPopup] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [scriptHeaders, setScriptHeaders] = useState<string[]>([]);
  const [scriptRows, setScriptRows] = useState<PlaywrightRow[]>([]);

  const playwrightScript = [
    {
      step: "Open page",
      code: "await page.goto('https://groww.in/stocks/intraday', { waitUntil: 'domcontentloaded', timeout: 60000 });",
    },
    {
      step: "Filter >1% change",
      code: "await page.getByText('Price change >1%').first().click();",
    },
    {
      step: "Open filter dropdown",
      code: "await page.locator('div').filter({ hasText: /^Price change >1%$/ }).nth(1).click();",
    },
    {
      step: "Confirm filter",
      code: "await page.locator('div').filter({ hasText: /^Price change >1%$/ }).nth(1).click();",
    },
    {
      step: "Select Today",
      code: "await page.getByText('Today').nth(1).click();",
    },
    {
      step: "Wait after selection",
      code: "await page.waitForTimeout(3000);",
    },
    {
      step: "Sort by column",
      code: "await page.locator('th:nth-child(5) > .flex > svg').click();",
    },
    {
      step: "Reverse sort",
      code: "await page.locator('th:nth-child(5) > .flex > svg').click();",
    },
    {
      step: "Wait for rows",
      code: "await page.waitForSelector('table tbody tr');",
    },
    {
      step: "Final delay",
      code: "await page.waitForTimeout(1000);",
    },
  ];

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
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const runPlaywrightScript = async () => {
    try {
      setShowScriptPopup(true);
      setScriptLoading(true);
      setScriptError("");
      setScriptRows([]);
      setScriptHeaders([]);

      const response = await fetch(`${API_PREFIX}/playwright-script`);
      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const body = await response.text();
        throw new Error(
          `Invalid JSON response from server: ${body.slice(0, 300)}`
        );
      }

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Playwright script failed");
      }

      setScriptHeaders(Array.isArray(data.headers) ? data.headers : []);
      setScriptRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (error) {
      console.error(error);
      setScriptError(
        error instanceof Error
          ? error.message
          : "Playwright script failed"
      );
    } finally {
      setScriptLoading(false);
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

            <div className="mt-8 pt-8 border-t border-slate-200 space-y-4">
              <button
                onClick={runPlaywrightScript}
                disabled={scriptLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black uppercase tracking-wider text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
              >
                {scriptLoading ? "Running Playwright..." : "Run Playwright Script"}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={executeOrder}
                disabled={loading}
                className="group relative flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-xl font-black text-white shadow-2xl shadow-blue-500/30 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <AnimatePresence>
              {showScriptPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-3xl overflow-hidden rounded-[40px] bg-white shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 p-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Playwright Script</h3>
                        <p className="text-sm text-slate-500">Runs Groww scanner and displays table rows.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={runPlaywrightScript}
                          disabled={scriptLoading}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {scriptLoading ? "Running..." : "Run"}
                        </button>
                        <button
                          onClick={() => setShowScriptPopup(false)}
                          className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[70vh] overflow-auto p-6">
                      {scriptLoading && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Running Playwright script...
                        </div>
                      )}

                      {scriptError && (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                          {scriptError}
                        </div>
                      )}

                      {scriptRows.length > 0 && (
                        <div className="mb-6 overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-900 text-white">
                              <tr>
                                {(scriptHeaders.length > 0 ? scriptHeaders : scriptRows[0].map((_, index) => `Column ${index + 1}`)).map((header) => (
                                  <th key={header} className="px-4 py-3 font-bold uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {scriptRows.map((row, rowIndex) => (
                                <tr key={`${row.join("-")}-${rowIndex}`}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={`${cell}-${cellIndex}`} className="px-4 py-3 font-bold text-slate-700">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!scriptLoading && !scriptError && scriptRows.length === 0 && (
                        <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                          No table data loaded yet.
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Step</th>
                              <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Playwright Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-slate-50">
                            {playwrightScript.map((item) => (
                              <tr key={item.step}>
                                <td className="px-4 py-4 font-bold text-slate-800 align-top">{item.step}</td>
                                <td className="px-4 py-4 text-slate-700">
                                  <code className="block rounded-2xl bg-white p-3 text-xs text-slate-800 shadow-sm">
                                    {item.code}
                                  </code>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
}
