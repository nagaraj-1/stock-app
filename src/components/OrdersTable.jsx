import { useState } from "react";

const STATUS_STYLES = {
  COMPLETE: { 
    dot: "bg-emerald-500", 
    text: "text-emerald-700 bg-emerald-500/10", 
    border: "border-emerald-500/20",
    accent: "bg-emerald-500"
  },
  PENDING: { 
    dot: "bg-amber-500", 
    text: "text-amber-700 bg-amber-500/10", 
    border: "border-amber-500/20",
    accent: "bg-amber-500"
  },
  CANCELLED: { 
    dot: "bg-slate-400", 
    text: "text-slate-600 bg-slate-400/10", 
    border: "border-slate-400/20",
    accent: "bg-slate-400"
  },
};

const USER_STYLES = {
  NAG: "bg-indigo-500/10 text-indigo-600 font-semibold",
  CUTIE: "bg-fuchsia-500/10 text-fuchsia-600 font-semibold",
};

export default function OrdersView({ orders = [],onCancelOrder, onTrackOrder, onSellOrder }) {
  return (
    <section className="relative w-full rounded-[2.5rem] bg-slate-900/5 backdrop-blur-3xl p-6 md:p-8 text-slate-800 border border-slate-200/60 shadow-[0_32px_100px_-20px_rgba(15,23,42,0.08)] overflow-hidden font-sans select-none">
      
      {/* Premium Fluid Ambient Backgrounds */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-400/0 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-gradient-to-tr from-emerald-300/20 to-teal-400/0 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Trading Operations</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Live Order Stream</h2>
        </div>

        {/* Dynamic Global Counters */}
        <div className="flex items-center gap-5 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Active Pool <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-md ml-1.5">{orders.length}</span>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <div className="text-xs text-slate-500 font-medium">
            Volume <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md ml-1.5">
              {orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID SYSTEM */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-slate-200 bg-white/40 rounded-3xl mt-6 transition-all">
          <div className="p-4 bg-slate-100 rounded-2xl mb-3 shadow-inner">
            <svg className="w-6 h-6 text-slate-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a48.654 48.654 0 011.066-5.32M3 12l-3-3m3 3l3-3m16.5 5.25v3.375c0 1.036-.84 1.875-1.875 1.875H18.75m-3 0H8.25m-3 0a1.875 1.875 0 01-1.875-1.875V14.25m16.5 0v3.375A3.375 3.375 0 0116.5 21h-9A3.375 3.375 0 014.125 17.625V14.25" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-semibold tracking-wide">Awaiting incoming API socket payloads...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-h-[720px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {orders.map((order, index) => {
            const price = order.average_price || order.trigger_price || 0;
            const isBuy = order.transaction_type === "BUY";
            const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            const userStyle = USER_STYLES[order.tableUser] || "bg-slate-100 text-slate-600 font-medium";

            return (
              <div
                key={order.order_id || index}
                className="group relative flex flex-col justify-between bg-white border border-slate-200/60 rounded-3xl pt-6 px-6 pb-4 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Dynamic Left Status Accent Accent Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${statusStyle.accent} opacity-80 transition-all group-hover:w-[6px]`} />

                {/* Card Top: Metadata Meta */}
                <div className="flex items-center justify-between gap-2 mb-4 pl-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg ${userStyle}`}>
                      {order.tableUser || "SYSTEM"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">#{order.order_id || "N/A"}</span>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${statusStyle.text} ${statusStyle.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {order.status}
                  </span>
                </div>

                {/* Card Mid: Asset Details */}
                <div className="flex items-center justify-between gap-4 mb-4 pl-1">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight transition-colors group-hover:text-indigo-900">
                      {order.tradingsymbol}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-1">
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {order.order_timestamp ? new Date(order.order_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-black font-mono tracking-wide px-3 py-1.5 rounded-xl border-2 ${
                    isBuy ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"
                  }`}>
                    {isBuy ? "↗" : "↘"} {order.transaction_type}
                  </span>
                </div>

                {/* Card Mid-Low: Segmented Numerical Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 ml-1">
                  <div className="pl-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Quantity</span>
                    <span className="text-base font-black text-slate-800 font-mono">{order.quantity}</span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Rate</span>
                    <span className="text-base font-mono font-black text-slate-900">₹{Number(price).toFixed(2)}</span>
                  </div>
                </div>

                {/* BRAND NEW ACTION ROW BUTTONS - FULL WIDTH */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 ml-1">
                  <button 
                    title="Liquidate Position" 
                     onClick={() =>
    onSellOrder(
      order
    )
  }
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100/70 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all duration-200 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span>SELL</span>
                  </button>

                  <button 
                            
                  onClick={() =>
    onTrackOrder(
      order.tableUser,
      order.order_id
    )
  }
                    title="AI Strategy Insight" 
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100/70 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all duration-200 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.954-8.955M21 12h0M12 3v0M3 12h0M12 21h0M4.93 19.07l.008-.008M19.07 4.93l-.008.008M19.07 19.07l-.008-.008M4.93 4.93l.008-.008"/>
                    </svg>
                    <span>AI</span>
                  </button>

                  <button 
                  onClick={() =>
    onCancelOrder(
      order.tableUser,
      order.order_id
    )
  }
                    title="Drop Record" 
                    className="flex-initial p-2.5 rounded-xl text-slate-400 hover:text-red-600 bg-slate-100/50 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200 active:scale-[0.95]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
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