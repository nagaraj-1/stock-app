import { useEffect, useState } from "react";
import { LineChart, TrendingUp, TrendingDown, Activity, ArrowRight } from "lucide-react";

export default function LiveStockPanel({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      const response = await fetch("https://stock.eatoo.in/api/stocks");
      const result = await response.json();
      const latestData = result?.data?.[result.data.length - 1];
      setStocks(latestData?.data || []);
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
    <div className="flex h-[400px] w-full max-w flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-xl backdrop-blur-md">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Live Market
            </span>
           
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
            <LineChart className="text-white" size={15} />
          </div>
        </div>

        {/* REFRESH STATUS */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100/70 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold tracking-wide text-slate-600">
              Auto-refreshing
            </span>
          </div>
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
            Every 30s
          </span>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Activity className="animate-pulse text-indigo-500" size={18} />
            <p className="text-[11px] font-medium text-slate-400">
              Fetching market feeds...
            </p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[11px] font-medium text-slate-400">
              No active stocks found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock, index) => {
              const changeValue = Number(stock.percentage);
              const isPositive = changeValue >= 0;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectStock?.(stock)}
                  className="group relative flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/60 hover:shadow-md"
                >
                  {/* LEFT: STOCK INFO */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold tracking-tight text-slate-800 transition-colors group-hover:text-indigo-600">
                        {stock.stock}
                      </span>
                      <ArrowRight 
                        size={10} 
                        className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-indigo-500" 
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-slate-400">Price:</span>
                      <span className="text-xs font-semibold text-slate-700">
                        ₹{Number(stock.currentPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: PERFORMANCE BADGE */}
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold tracking-tight ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={12} className="text-emerald-600" />
                    ) : (
                      <TrendingDown size={12} className="text-rose-600" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {changeValue}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}