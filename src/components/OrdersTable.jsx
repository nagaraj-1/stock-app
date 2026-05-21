import { useState } from "react";
import { Circle, User, Hash, Clock, ArrowUpRight, ArrowDownRight, TrendingDown, Brain, Trash2 } from "lucide-react";

const STATUS_STYLES = {
  COMPLETE: { 
    text: "text-emerald-600 bg-emerald-50 border-emerald-100", 
    dot: "bg-emerald-500",
    accent: "bg-emerald-500"
  },
  PENDING: { 
    text: "text-amber-600 bg-amber-50 border-amber-100", 
    dot: "bg-amber-500",
    accent: "bg-amber-500"
  },
  CANCELLED: { 
    text: "text-slate-500 bg-slate-50 border-slate-100", 
    dot: "bg-slate-400",
    accent: "bg-slate-400"
  },
};

const USER_STYLES = {
  NAG: "bg-indigo-50 text-indigo-600 border-indigo-100",
  CUTIE: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
};

export default function OrdersView({ orders = [], onCancelOrder, onTrackOrder, onSellOrder }) {
  return (
    <section className="relative w-full rounded-2xl bg-slate-50/40 p-5 text-slate-800 border border-slate-200/60 shadow-xl backdrop-blur-md overflow-hidden select-none">
      
      {/* Subtle Soft Ambient Glows */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Trading Operations</p>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Live Order Stream</h2>
        </div>

        {/* Compact Counters */}
        <div className="flex items-center gap-3 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
          <div className="text-[10px] text-slate-500 font-medium">
            Active Pool <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">{orders.length}</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="text-[10px] text-slate-500 font-medium">
            Volume <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md ml-1">
              {orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ORDERS SYSTEM */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 border border-dashed border-slate-200 bg-white/50 rounded-xl mt-4">
          <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl mb-2 animate-pulse">
            <Clock size={16} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">Awaiting socket stream data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {orders.map((order, index) => {
            const price = order.average_price || order.trigger_price || 0;
            const isBuy = order.transaction_type === "BUY";
            const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            const userStyle = USER_STYLES[order.tableUser] || "bg-slate-50 text-slate-600 border-slate-100";

            return (
              <div
                key={order.order_id || index}
                className="group relative flex flex-col justify-between bg-white border border-slate-100 rounded-xl p-3.5 transition-all duration-200 hover:border-slate-200/80 hover:shadow-md overflow-hidden"
              >
                {/* Left Micro Border Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${statusStyle.accent} opacity-80`} />

                {/* Card Header Metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded border ${userStyle}`}>
                      {order.tableUser || "SYSTEM"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                      <Hash size={10} className="opacity-70" />
                      {order.order_id || "N/A"}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.text}`}>
                    <Circle size={5} className={`fill-current ${statusStyle.dot}`} />
                    {order.status}
                  </span>
                </div>

                {/* Card Main Asset Info */}
                <div className="flex items-baseline justify-between gap-2 mb-2.5">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 transition-colors group-hover:text-indigo-600">
                      {order.tradingsymbol}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-0.5">
                      <Clock size={10} className="opacity-70" />
                      {order.order_timestamp ? new Date(order.order_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border ${
                    isBuy ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"
                  }`}>
                    {isBuy ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {order.transaction_type}
                  </span>
                </div>

                {/* Core Segmented Numbers */}
                <div className="grid grid-cols-2 gap-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100/60 mb-3">
                  <div className="pl-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Qty</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">{order.quantity}</span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Rate</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">₹{Number(price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Micro Action Layout */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => onSellOrder(order)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 hover:border-rose-200 transition-all active:scale-[0.97]"
                  >
                    <TrendingDown size={11} />
                    <span>SELL</span>
                  </button>

                  <button 
                    onClick={() => onTrackOrder(order.tableUser, order.order_id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-200 transition-all active:scale-[0.97]"
                  >
                    <Brain size={11} />
                    <span>AI</span>
                  </button>

                  <button 
                    onClick={() => onCancelOrder(order.tableUser, order.order_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-200 transition-all active:scale-[0.93]"
                    title="Drop Record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}