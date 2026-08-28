import { useEffect, useState } from "react";
import {
  Circle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Brain,
  Trash2,
  Square,
  Layers3,
  BarChart3,
  Activity,
} from "lucide-react";

// Make sure API_CONFIG is imported from your project
import { API_CONFIG } from "../config/apiConfig";

const STATUS_STYLES = {
  COMPLETE: {
    text: "text-emerald-700 bg-emerald-50/80 border-emerald-100",
    dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    accent: "bg-emerald-500",
    cardBg: "hover:bg-emerald-50/10",
  },
  PENDING: {
    text: "text-amber-700 bg-amber-50/80 border-amber-100",
    dot: "bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    accent: "bg-amber-500",
    cardBg: "hover:bg-amber-50/10",
  },
  CANCELLED: {
    text: "text-slate-500 bg-slate-100/80 border-slate-200",
    dot: "bg-slate-400",
    accent: "bg-slate-300",
    cardBg: "hover:bg-slate-50/50 opacity-75",
  },
};

const USER_THEME_PRESETS = {
  NAG: "from-indigo-50 to-cyan-50 text-indigo-700 border-indigo-100 shadow-[0_1px_2px_rgba(99,102,241,0.05)]",
  CUTIE:
    "from-fuchsia-50 to-rose-50 text-fuchsia-700 border-fuchsia-100 shadow-[0_1px_2px_rgba(217,70,239,0.05)]",
};

const getUserStyle = (username) => {
  if (!username) {
    return "from-slate-50 to-slate-100 text-slate-700 border-slate-200 shadow-sm";
  }

  if (USER_THEME_PRESETS[username]) {
    return USER_THEME_PRESETS[username];
  }

  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    "from-blue-50 to-sky-50 text-blue-700 border-blue-100",
    "from-violet-50 to-purple-50 text-violet-700 border-violet-100",
    "from-amber-50 to-orange-50 text-amber-700 border-amber-100",
    "from-teal-50 to-emerald-50 text-teal-700 border-teal-100",
    "from-pink-50 to-rose-50 text-pink-700 border-pink-100",
  ];

  const selectedIndex = Math.abs(hash) % palettes.length;

  return `${palettes[selectedIndex]} shadow-sm`;
};

export default function OrdersView({
  orders = [],
  onCancelOrder,
  onTrackOrder,
  onStopTrackOrder,
  onSellOrder,
}) {
  const [trackingOrders, setTrackingOrders] = useState({});
  const [sellPercentages, setSellPercentages] = useState({});

  // ============================================================
  // DEPTH ANALYSIS STATE
  // ============================================================

  const [depthAnalysis, setDepthAnalysis] = useState({});

  /*
    Example:

    depthAnalysis = {
      "12345": {
        running: true,
        buy: 1300000,
        sell: 800000,
        loading: false,
        error: false,
        updatedAt: Date.now()
      }
    }
  */

  // ============================================================
  // FETCH DEPTH
  // ============================================================

  const fetchDepth = async (order) => {
    if (!order?.tradingsymbol) {
      return;
    }

    const symbol = order.tradingsymbol;

    try {
      const response = await fetch(
        `${API_CONFIG.STOCK}/anays?symbol=${encodeURIComponent(symbol)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const buy = Number(data.buy_quantity || 0);
      const sell = Number(data.sell_quantity || 0);

      setDepthAnalysis((prev) => ({
        ...prev,
        [order.order_id]: {
          ...prev[order.order_id],
          running: true,
          buy,
          sell,
          loading: false,
          error: false,
          updatedAt: Date.now(),
        },
      }));
    } catch (error) {
      console.error(
        `DEPTH ANALYSIS ERROR: ${symbol}`,
        error
      );

      setDepthAnalysis((prev) => ({
        ...prev,
        [order.order_id]: {
          ...prev[order.order_id],
          loading: false,
          error: true,
        },
      }));
    }
  };

  // ============================================================
  // START DEPTH ANALYSIS
  // ============================================================

  const startDepthAnalysis = async (order) => {
    const orderId = order.order_id;

    // Mark running first
    setDepthAnalysis((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        running: true,
        loading: true,
        error: false,
      },
    }));

    // Immediately fetch once
    await fetchDepth(order);
  };

  // ============================================================
  // STOP DEPTH ANALYSIS
  // ============================================================

  const stopDepthAnalysis = (orderId) => {
    setDepthAnalysis((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        running: false,
      },
    }));
  };

  // ============================================================
  // AUTO POLLING EVERY 2 SECONDS
  // ============================================================

  useEffect(() => {
    const activeOrders = orders.filter(
      (order) => depthAnalysis[order.order_id]?.running
    );

    if (activeOrders.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      activeOrders.forEach((order) => {
        fetchDepth(order);
      });
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [orders, depthAnalysis]);

  // ============================================================
  // FORMAT QUANTITY
  // ============================================================

  const formatQuantity = (value) => {
    const num = Number(value || 0);

    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)}Cr`;
    }

    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    }

    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }

    return num.toLocaleString();
  };

  // ============================================================
  // DEPTH STRENGTH
  // ============================================================

  const getDepthStrength = (buy, sell) => {
    if (!buy && !sell) {
      return {
        label: "NO DATA",
        className: "text-slate-400",
      };
    }

    if (buy > sell) {
      return {
        label: "BUY STRONG",
        className: "text-emerald-600",
      };
    }

    if (sell > buy) {
      return {
        label: "SELL STRONG",
        className: "text-rose-600",
      };
    }

    return {
      label: "BALANCED",
      className: "text-amber-600",
    };
  };

  return (
    <section className="flex h-[250px] md:h-[38vh] flex-col overflow-hidden rounded-2xl border border-fuchsia-200/70 bg-white/90 shadow-[0_10px_30px_rgba(217,70,239,0.09)] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(217,70,239,0.14)]">

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {orders.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-violet-50 via-fuchsia-50/70 to-orange-50 text-fuchsia-500">
          <div className="rounded-full bg-white p-3 text-fuchsia-500 shadow-lg shadow-fuchsia-200/50">
            <Layers3 size={20} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-500">
            No Active Orders
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/50 p-3 scrollbar-thin">

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

            {orders.map((order, index) => {
              const price =
                Number(order.average_price) ||
                Number(order.trigger_price) ||
                Number(order.price) ||
                0;

              const isBuy = order.transaction_type === "BUY";

              const statusStyle =
                STATUS_STYLES[order.status] ||
                STATUS_STYLES.PENDING;

              const userThemeStyles =
                getUserStyle(order.tableUser);

              const isTracking =
                trackingOrders[order.order_id];

              const buyPercentage = 15.55;

              const sellPercentage =
                sellPercentages[order.order_id] ?? 16.8;

              const sellPrice = (
                (price / (1 + buyPercentage / 100)) *
                (1 + sellPercentage / 100)
              ).toFixed(2);

              // ==================================================
              // DEPTH DATA
              // ==================================================

              const depth =
                depthAnalysis[order.order_id] || {};

              const depthRunning =
                depth.running === true;

              const buyDepth =
                Number(depth.buy || 0);

              const sellDepth =
                Number(depth.sell || 0);

              const totalDepth =
                buyDepth + sellDepth;

              const buyRatio =
                totalDepth > 0
                  ? (buyDepth / totalDepth) * 100
                  : 0;

              const sellRatio =
                totalDepth > 0
                  ? (sellDepth / totalDepth) * 100
                  : 0;

              const depthStrength =
                getDepthStrength(
                  buyDepth,
                  sellDepth
                );

              return (
                <div
                  key={order.order_id || index}
                  className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-200 ${statusStyle.cardBg}`}
                >

                  {/* LEFT STATUS BAR */}

                  <span
                    className={`absolute bottom-0 left-0 top-0 w-1 transition-all duration-200 group-hover:w-1.5 ${statusStyle.accent}`}
                  />

                  {/* ==================================================
                      TOP SUMMARY
                  ================================================== */}

                  <div className="flex items-start justify-between gap-2 pl-1">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-1.5">

                        <span
                          className={`rounded border bg-gradient-to-br px-1 py-0.5 text-[8px] font-extrabold tracking-wide uppercase transition-all duration-300 ${userThemeStyles}`}
                        >
                          {order.tableUser || "SYS"}
                        </span>

                        <span className="truncate text-xs font-bold tracking-tight text-slate-800">
                          {order.tradingsymbol}
                        </span>

                        <span
                          className={`inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide ${
                            isBuy
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-rose-100 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isBuy ? (
                            <ArrowUpRight
                              size={10}
                              className="stroke-[3]"
                            />
                          ) : (
                            <ArrowDownRight
                              size={10}
                              className="stroke-[3]"
                            />
                          )}

                          {order.transaction_type}
                        </span>

                      </div>

                      {/* DATA MATRIX */}

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500">

                        <span>
                          Buy:{" "}
                          <span className="font-bold text-slate-900">
                            ₹
                            {Number(
                              order.trigger_price ||
                                order.price ||
                                0
                            ).toFixed(2)}
                          </span>
                        </span>

                        <span>
                          Qty:{" "}
                          <span className="font-bold text-slate-700">
                            {Number(
                              order.quantity || 0
                            ).toLocaleString()}
                          </span>
                        </span>

                        <span className="flex items-center gap-0.5 font-medium text-slate-400">

                          <Clock
                            size={9}
                            className="opacity-80"
                          />

                          {order.order_timestamp
                            ? new Date(
                                order.order_timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--"}

                        </span>

                      </div>
                    </div>

                    {/* STATUS */}

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase shadow-sm ${statusStyle.text}`}
                    >
                      <Circle
                        size={4}
                        className={`fill-current ${statusStyle.dot}`}
                      />

                      {order.status}
                    </span>

                  </div>

                  {/* ==================================================
                      DEPTH ANALYSIS PANEL
                  ================================================== */}

                  {depthRunning && (
                    <div className="mt-2 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/80 p-2">

                      {/* Header */}

                      <div className="mb-1.5 flex items-center justify-between">

                        <div className="flex items-center gap-1.5">

                          <Activity
                            size={11}
                            className="text-indigo-600 animate-pulse"
                          />

                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-700">
                            Live Depth Analysis
                          </span>

                        </div>

                        <span
                          className={`text-[8px] font-extrabold uppercase ${depthStrength.className}`}
                        >
                          {depthStrength.label}
                        </span>

                      </div>

                      {/* BUY / SELL VALUES */}

                      <div className="grid grid-cols-2 gap-1.5">

                        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1">

                          <div className="flex items-center justify-between">

                            <span className="text-[8px] font-semibold text-emerald-600">
                              BUY
                            </span>

                            <span className="text-[8px] font-bold text-emerald-500">
                              {buyRatio.toFixed(1)}%
                            </span>

                          </div>

                          <div className="mt-0.5 text-xs font-extrabold text-emerald-700">
                            {formatQuantity(buyDepth)}
                          </div>

                        </div>

                        <div className="rounded-md border border-rose-100 bg-rose-50 px-2 py-1">

                          <div className="flex items-center justify-between">

                            <span className="text-[8px] font-semibold text-rose-600">
                              SELL
                            </span>

                            <span className="text-[8px] font-bold text-rose-500">
                              {sellRatio.toFixed(1)}%
                            </span>

                          </div>

                          <div className="mt-0.5 text-xs font-extrabold text-rose-700">
                            {formatQuantity(sellDepth)}
                          </div>

                        </div>

                      </div>

                      {/* DEPTH BAR */}

                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">

                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${buyRatio}%`,
                          }}
                        />

                      </div>

                      {/* LAST UPDATE */}

                      <div className="mt-1 flex items-center justify-between">

                        <span className="text-[7px] text-slate-400">
                          Updates every 2 seconds
                        </span>

                        <span className="text-[7px] text-slate-400">
                          {depth.updatedAt
                            ? new Date(
                                depth.updatedAt
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "--"}
                        </span>

                      </div>

                    </div>
                  )}

                  {/* DIVIDER */}

                  <hr className="my-2.5 border-dashed border-slate-100 pl-1" />

                  {/* ==================================================
                      BOTTOM ACTION SECTION
                  ================================================== */}

                  <div className="flex items-center justify-between gap-2 pl-1">

                    {/* PRICING */}

                    <div className="flex items-center gap-2">

                      <div className="rounded-lg border border-emerald-100/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-1 text-xs font-extrabold text-emerald-700 shadow-sm">
                        ₹{sellPrice}
                      </div>

                      <div className="flex items-center gap-1">

                        <div className="relative flex items-center">

                          <input
                            type="number"
                            step="0.1"
                            value={sellPercentage}
                            onChange={(e) =>
                              setSellPercentages(
                                (prev) => ({
                                  ...prev,
                                  [order.order_id]:
                                    Number(
                                      e.target.value
                                    ),
                                })
                              )
                            }
                            className="w-16 rounded-md border border-slate-200 bg-slate-50/50 py-0.5 pr-2.5 text-center text-[10px] font-bold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                          />

                          <span className="pointer-events-none absolute right-1 text-[8px] font-bold text-slate-400">
                            %
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        BUTTON HUB
                    ================================================== */}

                    <div className="flex items-center gap-1.5">

                      {/* SELL */}

                      <button
                        type="button"
                        title="Sell Order"
                        onClick={() =>
                          onSellOrder(
                            order,
                            sellPrice
                          )
                        }
                        className="rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 text-emerald-700 shadow-sm transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white active:scale-95"
                      >
                        <TrendingDown
                          size={11}
                          className="stroke-[2.5]"
                        />
                      </button>

                      {/* ==================================================
                          DEPTH ANALYSIS BUTTON
                      ================================================== */}

                      {!depthRunning ? (
                        <button
                          type="button"
                          title="Start Depth Analysis"
                          onClick={() =>
                            startDepthAnalysis(order)
                          }
                          className="rounded-lg border border-cyan-100 bg-cyan-50 p-1.5 text-cyan-600 shadow-sm transition-all hover:border-cyan-600 hover:bg-cyan-600 hover:text-white active:scale-95"
                        >
                          <BarChart3
                            size={11}
                            className="stroke-[2.5]"
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Stop Depth Analysis"
                          onClick={() =>
                            stopDepthAnalysis(
                              order.order_id
                            )
                          }
                          className="rounded-lg border border-orange-100 bg-orange-50 p-1.5 text-orange-600 shadow-sm transition-all hover:border-orange-600 hover:bg-orange-600 hover:text-white active:scale-95"
                        >
                          <Square
                            size={10}
                            className="fill-current stroke-[2.5]"
                          />
                        </button>
                      )}

                      {/* TRACK TOGGLE */}

                      {!isTracking ? (
                        <button
                          type="button"
                          title="Start Auto Tracking"
                          onClick={() => {
                            setTrackingOrders(
                              (prev) => ({
                                ...prev,
                                [order.order_id]:
                                  true,
                              })
                            );

                            onTrackOrder(
                              order.tableUser,
                              order.order_id,
                              sellPrice
                            );
                          }}
                          className="rounded-lg border border-indigo-100 bg-indigo-50 p-1.5 text-indigo-600 shadow-sm transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white active:scale-95"
                        >
                          <Brain
                            size={11}
                            className="stroke-[2.5]"
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Stop Tracking"
                          onClick={() => {
                            setTrackingOrders(
                              (prev) => ({
                                ...prev,
                                [order.order_id]:
                                  false,
                              })
                            );

                            onStopTrackOrder(
                              order.tableUser,
                              order.order_id
                            );
                          }}
                          className="animate-pulse rounded-lg border border-rose-100 bg-rose-50 p-1.5 text-rose-600 shadow-sm transition-all hover:border-rose-600 hover:bg-rose-600 hover:text-white active:scale-95"
                        >
                          <Square
                            size={10}
                            className="fill-current stroke-[2.5]"
                          />
                        </button>
                      )}

                      {/* CANCEL */}

                      <button
                        type="button"
                        title="Cancel Order"
                        onClick={() =>
                          onCancelOrder(
                            order.tableUser,
                            order.order_id
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                      >
                        <Trash2
                          size={11}
                          className="stroke-[2.5]"
                        />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}