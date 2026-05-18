"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, TrendingUp, BarChart2 } from "lucide-react";
import { API_PREFIX } from "@/config/api";

interface IntradayStock {
  stock: string;
  ltp: string;
  change: string;
  volume: string;
  extra: string;
}

export default function IntradayPage() {
  const [stocks, setStocks] = useState<IntradayStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_PREFIX}/intraday-stocks`);
      const data = await response.json();
      if (data.status === "success") {
        setStocks(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch intraday stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // 30 seconds refresh
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (symbol: string) => {
    router.push(`/?symbol=${encodeURIComponent(symbol)}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Intraday Scanner</h1>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Initializing...'}
              </div>
            </div>
          </div>
          <button
            onClick={fetchStocks}
            disabled={loading}
            className="flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Scanning..." : "Refresh Now"}
          </button>
        </header>

        <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Stock Symbol</th>
                  <th className="px-6 py-5">LTP</th>
                  <th className="px-6 py-5">Change</th>
                  <th className="px-6 py-5">Volume</th>
                  <th className="px-8 py-5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map((stock, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    onClick={() => handleRowClick(stock.stock)}
                    className="cursor-pointer group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <BarChart2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-black text-slate-900">{stock.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-bold text-slate-700">{stock.ltp}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${stock.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {stock.change}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-500">{stock.volume}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end">
                        <TrendingUp className={`h-5 w-5 ${stock.change.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {stocks.length === 0 && !loading && (
            <div className="p-20 text-center text-slate-400 font-bold">No intraday data available. Start the scanner.</div>
          )}
        </div>
      </div>
    </div>
  );
}