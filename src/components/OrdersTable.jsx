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
  NAG: "bg-indigo-50 text-indigo-600 border-indigo-100",
  CUTIE: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
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
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_55px_-32px_rgba(15,23,42,0.45)]">
      {orders.length === 0 ? (
        <div className="m-5 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 sm:m-7">
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
        <div className="max-h-[580px] overflow-auto">
          <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {[
                  "Order",
                  "Instrument",
                  "Side",
                  "Quantity",
                  "Buy Price",
                  "Sell %",
                  "Sell Price",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-slate-100 px-5 py-4 first:pl-7 last:pr-7"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
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

                const sellPercentage =
                  sellPercentages[order.order_id] ?? 16.5;

                const sellPrice = (
                  (price / (1 + buyPercentage / 100)) *
                  (1 + sellPercentage / 100)
                ).toFixed(2);

                return (
                  <tr
                    key={order.order_id || index}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    {/* ORDER */}
                    <td className="relative border-b border-slate-100 px-5 py-4 pl-7">
                      <span
                        className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${statusStyle.accent}`}
                      />

                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${userStyle}`}
                      >
                        {order.tableUser || "SYSTEM"}
                      </span>

                      <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Hash size={11} />
                        {order.order_id || "N/A"}
                      </p>
                    </td>

                    {/* INSTRUMENT */}
                    <td className="border-b border-slate-100 px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {order.tradingsymbol || "--"}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />

                        {order.order_timestamp
                          ? new Date(
                            order.order_timestamp
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                          : "--:--:--"}
                      </p>
                    </td>

                    {/* SIDE */}
                    <td className="border-b border-slate-100 px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${isBuy
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                          }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <ArrowDownRight size={13} />
                        )}

                        {order.transaction_type || "--"}
                      </span>
                    </td>

                    {/* QUANTITY */}
                    <td className="border-b border-slate-100 px-5 py-4 font-mono text-sm font-semibold text-slate-700">
                      {Number(order.quantity || 0).toLocaleString()}
                    </td>

                    {/* BUY PRICE */}
                    <td className="border-b border-slate-100 px-5 py-4 font-mono text-sm font-bold text-slate-900">
                      {order.trigger_price? order.trigger_price : order.price}
                    </td>

                    {/* SELL % */}
                    <td className="border-b border-slate-100 px-5 py-4">
                      <div className="flex items-center gap-2">
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
                          className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                        <span className="text-sm font-bold text-slate-500">
                          %
                        </span>
                      </div>
                    </td>

                    {/* SELL PRICE */}
                    <td className="border-b border-slate-100 px-5 py-4">
                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                        ₹{sellPrice}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="border-b border-slate-100 px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusStyle.text}`}
                      >
                        <Circle
                          size={7}
                          className={`fill-current ${statusStyle.dot}`}
                        />

                        {order.status || "PENDING"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="border-b border-slate-100 px-5 py-4 pr-7">
                      <div className="flex items-center justify-end gap-2">
                        {/* SELL */}
                        <button
                          type="button"
                          onClick={() =>
                            onSellOrder(
                              order,
                              sellPrice,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <TrendingDown size={13} />
                          Sell
                        </button>

                        {/* TRACK */}
                        {!isTracking ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTrackingOrders((prev) => ({
                                ...prev,
                                [order.order_id]: true,
                              }));

                              onTrackOrder(
                                order.tableUser,
                                order.order_id
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
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

                              onStopTrackOrder(
                                order.tableUser,
                                order.order_id
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                          >
                            <Square size={12} />
                            Stop
                          </button>
                        )}

                        {/* CANCEL */}
                        <button
                          type="button"
                          onClick={() =>
                            onCancelOrder(
                              order.tableUser,
                              order.order_id
                            )
                          }
                          aria-label="Cancel order"
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}