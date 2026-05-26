import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

import API_CONFIG from "../config/apiConfig";

export default function LiveStockPanel({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.STOCK}/stocks`);
      const result = await response.json();

      const latestData = result?.data?.[result.data.length - 1];

      // SORT HIGH TO LOW %
      const sortedStocks = (latestData?.data || []).sort(
        (a, b) => Number(b.percentage) - Number(a.percentage)
      );

      setStocks(sortedStocks);
    } catch (error) {
      console.error("API ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();

    const interval = setInterval(fetchStocks, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[250px] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-100 px-3 py-2">
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">

          {/* LIVE STATUS */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>

              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>

            <span className="text-[9px] font-semibold text-slate-600 uppercase">
              Live Stocks
            </span>
          </div>

          <span className="text-[8px] text-slate-400">
            Every 30s
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">

        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <Activity
              className="animate-pulse text-indigo-500"
              size={14}
            />

            <p className="text-[10px] text-slate-400">
              Loading...
            </p>
          </div>

        ) : stocks.length === 0 ? (

          <div className="flex h-full items-center justify-center">
            <p className="text-[10px] text-slate-400">
              No stocks found
            </p>
          </div>

        ) : (

          stocks.map((stock, index) => {
            const changeValue = Number(stock.percentage);
            const isPositive = changeValue >= 0;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectStock?.(stock)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white  transition hover:bg-slate-50"
              >

                {/* LEFT + RIGHT */}
                <div className="flex w-full items-center justify-between">

                  {/* STOCK NAME */}
                  <span className="text-[11px] font-semibold text-slate-800">
                    {stock.stock}
                  </span>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-2">

                    {/* AMOUNT */}
                    <span className="text-[10px] font-medium text-slate-600">
                      ₹
                      {Number(stock.currentPrice).toLocaleString("en-IN")}
                    </span>

                    {/* PERCENTAGE */}
                    <div
                      className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold ${
                        isPositive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}

                      <span>
                        {isPositive ? "+" : ""}
                        {changeValue}%
                      </span>
                    </div>

                  </div>
                </div>
              </button>
            );
          })

        )}
      </div>
    </div>
  );
}