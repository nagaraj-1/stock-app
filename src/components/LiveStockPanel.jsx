import { useEffect, useState } from "react";
import { RefreshCw, X, TrendingUp, TrendingDown } from "lucide-react";
import API_CONFIG from "../config/apiConfig";

export default function LiveStockPanel({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const handleSkip = async (symbol, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_CONFIG.STOCK}/add-skip-stock?symbol=${symbol}`, {
        method: "POST",
      });
      setStocks((prev) => prev.filter((item) => item.stock !== symbol));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.STOCK}/stocks`);
      const result = await response.json();
      const latestData = result?.data?.[result.data.length - 1];

      setStocks(
        (latestData?.data || []).sort(
          (a, b) => Number(b.percentage) - Number(a.percentage)
        )
      );
    } catch (error) {
      console.error(error);
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
    <div className="flex h-[140px] md:h-[38vh] w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* HEADER WITH SUBTLE GRADIENT */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3 py-2 z-10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            Live Market
          </h2>
        </div>

        <button
          onClick={() => {
            setSyncing(true);
            fetchStocks().finally(() => setSyncing(false));
          }}
          className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-95"
          title="Force Sync"
        >
          <RefreshCw
            className={`h-3 w-3 ${syncing ? "animate-spin text-emerald-500" : ""}`}
          />
        </button>
      </div>

      {/* STOCK LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-50/30">
        {loading ? (
          /* SKELETON LOADER FOR GRID */
          <div className="grid grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-b border-r border-slate-100 px-3 py-2"
              >
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200"></div>
                <div className="flex-1"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-slate-200"></div>
                <div className="h-4 w-9 animate-pulse rounded-full bg-slate-200"></div>
              </div>
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-[11px] text-slate-400">
            <TrendingUp className="h-4 w-4 opacity-50" />
            <span>No stocks found</span>
          </div>
        ) : (
          /* DATA GRID */
          <div className="grid grid-cols-2">
            {stocks.map((stock) => {
              const isPos = Number(stock.percentage) >= 0;

              return (
                <div
                  key={stock.stock}
                  onClick={() => onSelectStock?.(stock)}
                  className={`group relative flex cursor-pointer items-center gap-1.5 border-b border-r border-slate-100 bg-white px-2 py-1.5 transition-all duration-200 hover:bg-slate-50 hover:shadow-[inset_0_0_12px_rgba(0,0,0,0.02)]`}
                >
                  {/* LEFT ACCENT LINE */}
                  <div
                    className={`absolute bottom-0 left-0 top-0 w-[3px] transition-colors ${isPos ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                  />

                  {/* SYMBOL */}
                  <span className="ml-1 w-[52px] shrink-0 truncate text-[11px] font-bold text-slate-800">
                    {stock.stock}
                  </span>

                  {/* PRICE */}
                  <span className="flex-1 text-right font-mono text-[11px] font-medium tabular-nums text-slate-600">
                    ₹{Number(stock.currentPrice).toFixed(1)}
                  </span>

                  {/* CHANGE BADGE (PILL) */}
                  <span
                    className={`flex w-10 shrink-0 items-center justify-center rounded-full py-[2px] text-[9.5px] font-bold tracking-tight tabular-nums transition-colors ${isPos
                        ? "bg-emerald-100/80 text-emerald-700 group-hover:bg-emerald-100"
                        : "bg-rose-100/80 text-rose-700 group-hover:bg-rose-100"
                      }`}
                  >
                    {isPos ? "+" : ""}
                    {Number(stock.percentage).toFixed(1)}%
                  </span>

                  {/* SKIP BUTTON */}
                  <button
                    onClick={(e) => handleSkip(stock.stock, e)}
                    className="flex shrink-0 items-center justify-center rounded-full p-[2px] text-slate-300 opacity-0 transition-all hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                    title="Skip Stock"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}