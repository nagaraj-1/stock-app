import { useEffect, useState } from "react";
import { LineChart, TrendingUp } from "lucide-react";

export default function LiveStockPanel({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // API CALL
  const fetchStocks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/stocks");

      const result = await response.json();

      // GET LATEST DATA
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

    // AUTO REFRESH EVERY 10 SEC
    const interval = setInterval(fetchStocks, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Live Stocks
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Real-time market movers
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-50 p-3">
          <LineChart className="text-indigo-500" size={24} />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-semibold text-slate-400">
              Loading stocks...
            </p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-semibold text-slate-400">
              No stocks available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stocks.map((stock, index) => (
              <button
                type="button"
                key={index}
                onClick={() => onSelectStock?.(stock)}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {/* LEFT */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700">
                    {stock.stock}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    ₹ {stock.currentPrice}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2 rounded-xl bg-green-100 px-3 py-2">
                  <TrendingUp size={16} className="text-green-600" />

                  <span className="text-sm font-black text-green-700">
                    {stock.percentage}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
