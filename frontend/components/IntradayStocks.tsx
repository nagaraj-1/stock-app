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

function getSymbol(stock: IntradayStock) {
  return (stock.symbol || stock.stock).trim().toUpperCase();
}

function parsePrice(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function parsePercentage(value: string) {
  const match = value.match(/([-+]?\d+(?:\.\d+)?)%/);
  return match ? Number(match[1]) : 0;
}

export default function IntradayStocks({
  onSelectStock,
}: IntradayStocksProps) {
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
    const fallbackSymbol = getSymbol(stock);
    const selectedStock = {
      symbol: fallbackSymbol,
      price: parsePrice(stock.ltp),
      percentage: parsePercentage(stock.change),
    };

    try {
      setResolvingSymbol(fallbackSymbol);

      const response = await fetch(
        `${API_PREFIX}/stock-symbol?stock_name=${encodeURIComponent(stock.stock)}`
      );
      const data = await response.json();

     console.log(data)

   
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

  return (
    <section className="mt-8 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Intraday Stocks</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Auto refresh every 30 sec{lastUpdated ? ` - ${lastUpdated}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={loadStocks}
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-8 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-white">
            <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              <th className="px-8 py-4">Stock</th>
              <th className="px-8 py-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.map((stock, index) => {
              const symbol = getSymbol(stock);
              const percentValue = parsePercentage(stock.change);
              const isNegative = percentValue < 0;

              return (
                <tr
                  key={`${symbol}-${index}`}
                  onClick={() => selectStock(stock)}
                  className="cursor-pointer transition hover:bg-emerald-50/60"
                >
                  {/* Stock Name Column */}
                  <td className="px-8 py-4 font-bold text-slate-900">
                    {stock.stock}
                  </td>
                  
                  {/* Price & Highlighted Percentage Column */}
                  <td className="px-8 py-4 text-right font-bold text-slate-800">
                    <div className="flex items-center justify-end gap-3">
                      <span>{stock.ltp}</span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-black ${
                          isNegative
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isNegative ? "" : "+"}{percentValue}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && stocks.length === 0 && (
              <tr>
                <td colSpan={2} className="px-8 py-10 text-center text-sm font-bold text-slate-400">
                  No intraday stock data loaded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}