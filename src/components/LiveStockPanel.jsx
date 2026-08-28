import { useEffect, useState } from "react";
import {
  RefreshCw,
  X,
  TrendingUp,
  Zap,
} from "lucide-react";
import API_CONFIG from "../config/apiConfig";

export default function LiveStockPanel({
  onSelectStock,
  executeOrder,
}) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Selected stock
  const [selectedStock, setSelectedStock] =
    useState(null);

  // Currently executing stock
  const [executingStock, setExecutingStock] =
    useState(null);

  // ============================================================
  // SKIP STOCK
  // ============================================================

  const handleSkip = async (symbol, e) => {
    e.stopPropagation();

    try {
      const response = await fetch(
        `${API_CONFIG.STOCK}/add-skip-stock?symbol=${encodeURIComponent(
          symbol
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Skip API failed: ${response.status}`
        );
      }

      // Remove stock from UI
      setStocks((prev) =>
        prev.filter(
          (item) => item.stock !== symbol
        )
      );

      // Clear selection
      setSelectedStock((prev) =>
        prev === symbol ? null : prev
      );
    } catch (error) {
      console.error(
        "Skip stock error:",
        error
      );
    }
  };

  // ============================================================
  // FETCH STOCKS
  // ============================================================

  const fetchStocks = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.STOCK}/stocks`
      );

      if (!response.ok) {
        throw new Error(
          `Stocks API failed: ${response.status}`
        );
      }

      const result = await response.json();

      const latestData =
        result?.data?.[
          result.data.length - 1
        ];

      const stockData = Array.isArray(
        latestData?.data
      )
        ? latestData.data
        : [];

      // Sort highest percentage first
      const sortedStocks = [...stockData].sort(
        (a, b) =>
          Number(b.percentage || 0) -
          Number(a.percentage || 0)
      );

      setStocks(sortedStocks);

      // Check selected stock still exists
      setSelectedStock((current) => {
        if (!current) {
          return null;
        }

        const exists = sortedStocks.some(
          (item) => item.stock === current
        );

        return exists ? current : null;
      });
    } catch (error) {
      console.error(
        "Fetch stocks error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD + AUTO REFRESH
  // ============================================================

  useEffect(() => {
    fetchStocks();

    const interval = setInterval(
      fetchStocks,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // SELECT STOCK
  // ============================================================

  const handleStockClick = async (
    stock,
    e
  ) => {
    e.stopPropagation();

    // If already selected, deselect
    if (selectedStock === stock.stock) {
      setSelectedStock(null);
      return;
    }

    // Select immediately
    setSelectedStock(stock.stock);

    console.log(
      "SELECTED STOCK:",
      stock
    );

    // Notify parent
    try {
      await onSelectStock?.(stock);
    } catch (error) {
      console.error(
        "Select stock error:",
        error
      );
    }
  };

  // ============================================================
  // EXECUTE STOCK
  // ============================================================

  const handleExecute = async (
    stock,
    e
  ) => {
    e.stopPropagation();

    // Prevent multiple executions
    if (executingStock) {
      return;
    }

    try {
      setExecutingStock(stock.stock);

      console.log(
        "EXECUTE STOCK:",
        stock
      );

      // Execute directly.
      // Stock was already selected.
      await executeOrder?.(stock);
    } catch (error) {
      console.error(
        "Execute stock error:",
        error
      );
    } finally {
      setExecutingStock(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-[140px] w-full flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/90 shadow-[0_10px_30px_rgba(16,185,129,0.10)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(16,185,129,0.16)] md:h-[38vh]">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="z-10 flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-50 px-3 py-2 shadow-sm">

        {/* TITLE */}

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            Live Market
          </h2>

          {/* Selected stock */}

          {selectedStock && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-700">
              {selectedStock}
            </span>
          )}
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={() => {
            setSyncing(true);

            fetchStocks().finally(() =>
              setSyncing(false)
            );
          }}
          className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-95"
          title="Force Sync"
        >
          <RefreshCw
            className={`h-3 w-3 ${
              syncing
                ? "animate-spin text-emerald-500"
                : ""
            }`}
          />
        </button>
      </div>

      {/* ======================================================
          STOCK LIST
      ======================================================= */}

      <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-50/30">

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="grid grid-cols-2">
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <div
                key={i}
                className="flex h-9 items-center gap-2 border-b border-r border-slate-100 px-2"
              >
                <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />

                <div className="flex-1" />

                <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />

                <div className="h-4 w-10 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : stocks.length === 0 ? (
          /* ==================================================
             EMPTY
          ================================================== */

          <div className="flex h-full flex-col items-center justify-center gap-1 text-[11px] text-slate-400">
            <TrendingUp className="h-4 w-4 opacity-50" />

            <span>
              No stocks found
            </span>
          </div>
        ) : (
          /* ==================================================
             TWO STOCKS PER ROW
          ================================================== */

          <div className="grid grid-cols-2">
            {stocks.map((stock) => {
              const percentage =
                Number(
                  stock.percentage || 0
                );

              const price =
                Number(
                  stock.currentPrice || 0
                );

              const isPos =
                percentage >= 0;

              const isSelected =
                selectedStock ===
                stock.stock;

              const isExecuting =
                executingStock ===
                stock.stock;

              return (
                <div
                  key={stock.stock}
                  onClick={(e) =>
                    handleStockClick(
                      stock,
                      e
                    )
                  }
                  className={`
                    group flex h-9
                    min-w-0
                    cursor-pointer
                    items-center
                    gap-1
                    border-b
                    border-r
                    px-2
                    transition-all
                    duration-150
                    ${
                      isSelected
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-emerald-100/60 bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50"
                    }
                  `}
                >
                  {/* =================================================
                      STOCK NAME
                  ================================================== */}

                  <span
                    className={`
                      min-w-0
                      flex-1
                      truncate
                      text-[10px]
                      font-bold
                      ${
                        isSelected
                          ? "text-emerald-700"
                          : "text-slate-800"
                      }
                    `}
                    title={stock.stock}
                  >
                    {stock.stock}
                  </span>

                  {/* =================================================
                      PRICE
                  ================================================== */}

                  <span className="shrink-0 font-mono text-[9px] font-medium tabular-nums text-slate-600">
                    ₹{price.toFixed(1)}
                  </span>

                  {/* =================================================
                      PERCENTAGE
                  ================================================== */}

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-1.5
                      py-[2px]
                      text-[8px]
                      font-bold
                      tabular-nums
                      ${
                        isPos
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }
                    `}
                  >
                    {isPos
                      ? "+"
                      : ""}
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </span>

                  {/* =================================================
                      EXECUTE
                  ================================================== */}

                  {isSelected && (
                    <button
                      type="button"
                      disabled={isExecuting}
                      onClick={(e) =>
                        handleExecute(
                          stock,
                          e
                        )
                      }
                      className={`
                        flex
                        h-5
                        shrink-0
                        items-center
                        gap-0.5
                        rounded-md
                        px-1.5
                        text-[8px]
                        font-bold
                        text-white
                        shadow-sm
                        transition-all
                        active:scale-95
                        ${
                          isExecuting
                            ? "cursor-not-allowed bg-slate-400"
                            : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-md"
                        }
                      `}
                      title={`Execute ${stock.stock}`}
                    >
                      <Zap
                        size={9}
                        strokeWidth={3}
                        className={
                          isExecuting
                            ? "animate-pulse"
                            : ""
                        }
                      />

                      {isExecuting
                        ? "..."
                        : "Execute"}
                    </button>
                  )}

                  {/* =================================================
                      SKIP
                  ================================================== */}

                  <button
                    type="button"
                    onClick={(e) =>
                      handleSkip(
                        stock.stock,
                        e
                      )
                    }
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-300 transition-all hover:bg-rose-500 hover:text-white"
                    title="Skip Stock"
                  >
                    <X
                      size={11}
                      strokeWidth={2.5}
                    />
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