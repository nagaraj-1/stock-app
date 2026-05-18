"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { API_PREFIX } from "@/config/api";

type IntradayStock = {
  stock: string;
  symbol?: string;
  ltp: string;
  change: string;
  volume: string;
  extra: string;
};

export type SelectedIntradayStock = {
  symbol: string;
  price: number;
  percentage: number;
};

type IntradayStocksProps = {
  onSelectStock: (stock: SelectedIntradayStock) => void;
};

const REFRESH_MS = 30000;

// Upgraded robust cleanup function to catch varied text strings
function cleanStockName(name: string): string {
  if (!name) return "";
  return name
    .replace(/(?:results\s+today|today\s+results|in\s+news|yesterday\s+results)/gi, "") // Cleans key phrases
    .replace(/(?:stock\s*price)/gi, "") // Cleans "StockPrice" prefixes if attached
    .replace(/[-\s()[\]:,\d.+%₹]+$/, "") // Cleans trailing hyphens, brackets, or runaway numbers/symbols
    .trim();
}

function getSymbol(stock: IntradayStock) {
  const cleanedName = cleanStockName(stock.stock);
  return (stock.symbol || cleanedName).trim().toUpperCase();
}

function parsePrice(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function parsePercentage(value: string) {
  const match = value.match(/([-+]?\d+(?:\.\d+)?)%/);
  return match ? Number(match[1]) : 0;
}

function getPercentageBadgeStyles(percent: number) {
  if (percent < 0) {
    return "bg-rose-50 text-rose-600 border border-rose-100"; 
  }
  if (percent >= 16) {
    return "bg-amber-100 text-amber-800 border border-amber-200"; 
  }
  if (percent >= 15 && percent < 16) {
    return "bg-purple-600 text-white shadow-sm"; 
  }
  if (percent >= 10 && percent < 15) {
    return "bg-emerald-600 text-white shadow-sm"; 
  }
  return "bg-emerald-50 text-emerald-600 border border-emerald-100"; 
}

export default function IntradayStocks({ onSelectStock }: IntradayStocksProps) {
  const [stocks, setStocks] = useState<IntradayStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvingSymbol, setResolvingSymbol] = useState("");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_PREFIX}/intraday-stocks`);
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to load intraday stocks");
      }

      setStocks(Array.isArray(data.data) ? data.data : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load intraday stocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      loadStocks();
    }, 0);

    const timer = window.setInterval(() => {
      loadStocks();
    }, REFRESH_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [loadStocks]);

  const selectStock = async (stock: IntradayStock) => {
    if (resolvingSymbol) return; 
    const fallbackSymbol = getSymbol(stock);
    const cleanedName = cleanStockName(stock.stock);
    
    const selectedStock = {
      symbol: fallbackSymbol,
      price: parsePrice(stock.ltp),
      percentage: parsePercentage(stock.change),
    };

    try {
      setResolvingSymbol(fallbackSymbol);

      const response = await fetch(
        `${API_PREFIX}/stock-symbol?stock_name=${encodeURIComponent(cleanedName)}`
      );
      const data = await response.json();

      onSelectStock({
        ...selectedStock,
        symbol: String(data).toUpperCase(),
      });
    } catch (err) {
      console.error(err);
      onSelectStock(selectedStock);
    } finally {
      setResolvingSymbol("");
    }
  };

  const firstTableStocks = stocks.slice(0, 10);
  const secondTableStocks = stocks.slice(10);

  const MiniStockTable = ({ title, dataList, startIndex }: { title: string; dataList: IntradayStock[]; startIndex: number }) => (
    <div className="flex-1 min-w-[280px] bg-slate-50/40 rounded-2xl p-4 border border-slate-100">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-2">
        {title} ({dataList.length > 0 ? `${startIndex + 1}-${startIndex + dataList.length}` : "0"})
      </h3>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-400">
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.map((stock, index) => {
              const symbol = getSymbol(stock);
              const percentValue = parsePercentage(stock.change);
              const isResolvingThis = resolvingSymbol === symbol;

              return (
                <tr
                  key={`${symbol}-${startIndex + index}`}
                  onClick={() => selectStock(stock)}
                  className={`group transition hover:bg-slate-50 ${
                    resolvingSymbol ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                >
                  <td className="px-3 py-2.5 font-bold text-slate-800 group-hover:text-emerald-600 transition truncate max-w-[140px]">
                    {cleanStockName(stock.stock)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
                    <div className="flex items-center justify-end gap-2">
                      {isResolvingThis ? (
                        <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                      ) : (
                        <>
                          <span>{stock.ltp}</span>
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black tracking-wide min-w-[54px] text-center ${getPercentageBadgeStyles(
                              percentValue
                            )}`}
                          >
                            {percentValue > 0 ? "+" : ""}
                            {percentValue}%
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {dataList.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-8 text-center font-medium text-slate-400">
                  No records to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-md font-black text-slate-900">Intraday Stocks Watch</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Auto refresh every 30s {lastUpdated ? `• ${lastUpdated}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={loadStocks}
          disabled={loading}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 p-4">
        <MiniStockTable title="Stocks List (Part 1)" dataList={firstTableStocks} startIndex={0} />
        <MiniStockTable title="Stocks List (Part 2)" dataList={secondTableStocks} startIndex={10} />
      </div>
    </section>
  );
}