import { useState } from "react";
import {
  Circle,
  Hash,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Brain,
  Trash2,
  Square,
  Layers3,
} from "lucide-react";

const STATUS_STYLES = {
  COMPLETE: {
    text: "text-emerald-600 bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-500",
    accent: "bg-emerald-500",
  },
  PENDING: {
    text: "text-amber-600 bg-amber-50 border-amber-100",
    dot: "bg-amber-500",
    accent: "bg-amber-500",
  },
  CANCELLED: {
    text: "text-slate-500 bg-slate-50 border-slate-100",
    dot: "bg-slate-400",
    accent: "bg-slate-400",
  },
};

const USER_STYLES = {
  // NAG: Dark Blue - Indigo 800/900 range
  NAG: "bg-indigo-100 text-indigo-900 border-indigo-200",
  
  // CUTIE: Dark Pink - Fushia 800/900 range
  CUTIE: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
};

export default function OrdersView({
  orders = [],
  onCancelOrder,
  onTrackOrder,
  onStopTrackOrder,
  onSellOrder,
}) {
  // ==========================================
  // TRACKING STATE
  // ==========================================
  const [trackingOrders, setTrackingOrders] = useState({});

  // ==========================================
  // SELL PERCENTAGE STATE
  // ==========================================
  const [sellPercentages, setSellPercentages] = useState({});

  return (
    <section className="w-full flex flex-col rounded-3xl border border-slate-200 bg-white shadow-[0_20px_55px_-32px_rgba(15,23,42,0.45)] overflow-hidden">
      
      {/* FIXED HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-7 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Live Orders Overview
          </h3>
          {orders.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {orders.length} active trade metrics
            </p>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="m-5 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 sm:m-7">
          <div className="mb-3 rounded-2xl bg-white p-3 text-slate-400 shadow-sm">
            <Layers3 size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            No live orders yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            New orders will appear here automatically.
          </p>
        </div>
      ) : (
        /* SCROLLABLE CARD GRID CONTAINER */
        <div className="max-h-[580px] overflow-y-auto p-5 sm:p-7 bg-slate-50/40">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {orders.map((order, index) => {
              const price =
                Number(order.average_price) ||
                Number(order.trigger_price) ||
                0;

              const isBuy = order.transaction_type === "BUY";

              const statusStyle =
                STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;

              const userStyle =
                USER_STYLES[order.tableUser] ||
                "bg-slate-50 text-slate-600 border-slate-200";

              const isTracking = trackingOrders[order.order_id];

              // ==========================================
              // SELL CALCULATION
              // ==========================================
              const buyPercentage = 15.55;
              const sellPercentage = sellPercentages[order.order_id] ?? 16.5;
              const sellPrice = (
                (price / (1 + buyPercentage / 100)) *
                (1 + sellPercentage / 100)
              ).toFixed(2);

              return (
                <div
                  key={order.order_id || index}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Left Accent Status Bar */}
                  <span
                    className={`absolute bottom-0 left-0 top-0 w-1.5 ${statusStyle.accent}`}
                  />

                  {/* HEADER: User, Status & ID */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${userStyle}`}
                      >
                        {order.tableUser || "SYSTEM"}
                      </span>
                      <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Hash size={11} />
                        {order.order_id || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyle.text}`}
                    >
                      <Circle
                        size={6}
                        className={`fill-current ${statusStyle.dot}`}
                      />
                      {order.status || "PENDING"}
                    </span>
                  </div>

                  {/* INSTRUMENT & SIDE */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {order.tradingsymbol || "--"}
                      </h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {order.order_timestamp
                          ? new Date(order.order_timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "--:--:--"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        isBuy
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {isBuy ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {order.transaction_type || "--"}
                    </span>
                  </div>

                  <hr className="my-4 border-slate-100" />

                  {/* INFO METRICS GRID */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Quantity</p>
                      <p className="mt-0.5 font-mono font-semibold text-slate-700">
                        {Number(order.quantity || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Buy Price</p>
                      <p className="mt-0.5 font-mono font-bold text-slate-900">
                        {order.trigger_price ? order.trigger_price : order.price}
                      </p>
                    </div>
                  </div>

                  {/* PRICING INPUTS / OUTPUTS */}
                  <div className="mt-4 grid grid-cols-2 gap-3 items-center">
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Sell %</p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          value={sellPercentage}
                          onChange={(e) =>
                            setSellPercentages((prev) => ({
                              ...prev,
                              [order.order_id]: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                        <span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Sell Price</p>
                      <div className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-700 text-center">
                        ₹{sellPrice}
                    </div>
                    </div>
                  </div>

                  <hr className="my-4 border-slate-100" />

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">
                    {/* SELL */}
                    <button
                      type="button"
                      onClick={() => onSellOrder(order, sellPrice)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <TrendingDown size={13} />
                      Sell
                    </button>

                    {/* TRACK / STOP */}
                    {!isTracking ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackingOrders((prev) => ({
                            ...prev,
                            [order.order_id]: true,
                          }));
                          onTrackOrder(order.tableUser, order.order_id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        <Brain size={13} />
                        Track
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackingOrders((prev) => ({
                            ...prev,
                            [order.order_id]: false,
                          }));
                          onStopTrackOrder(order.tableUser, order.order_id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                      >
                        <Square size={12} />
                        Stop
                      </button>
                    )}

                    {/* CANCEL */}
                    <button
                      type="button"
                      onClick={() => onCancelOrder(order.tableUser, order.order_id)}
                      aria-label="Cancel order"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
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