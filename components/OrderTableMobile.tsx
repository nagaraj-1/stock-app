"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Package2 } from "lucide-react";
import { Order } from "@/types/order";

type OrderTableMobileProps = {
  orders: Order[];
  onAiTrack: (order: Order) => void;
  onStop: (orderId: string) => void;
  onSell: (order: Order) => void;
  onCancel: (id: string, platform: string) => void;
};

export default function OrderTableMobile({
  orders,
  onAiTrack,
  onStop,
  onSell,
  onCancel,
}: OrderTableMobileProps) {
  return (
    <div className="space-y-4 lg:hidden">
      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/50 bg-white/90 p-5 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-black text-slate-900">{order.symbol}</div>
                <div className="mt-1 font-mono text-xs text-slate-700">{order.id}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "Executed" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                {order.status}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Qty</div>
                <div className="mt-1 flex items-center gap-2 font-bold text-blue-600">
                  <Package2 className="h-4 w-4" />
                  {order.qty}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Amount</div>
                <div className="mt-1 font-bold">₹{order.price}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">User</div>
                <div className="mt-1 font-semibold">{order.user}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Platform</div>
                <div className="mt-1 font-semibold">{order.platform}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">%</div>
                <div className={`mt-1 font-bold ${Number(order.percentage) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {order.percentage}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Time</div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4" />
                  {order.time}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <button
                onClick={() => onAiTrack(order)}
                className="h-12 rounded-2xl bg-violet-600 text-xs font-bold text-white transition-all hover:bg-violet-700"
              >
                AI Mode
              </button>
              <button
                onClick={() => onStop(order.id)}
                className="h-12 rounded-2xl bg-black text-xs font-bold text-white"
              >
                Stop
              </button>
              <button
                onClick={() => onSell(order)}
                className="h-12 rounded-2xl bg-orange-500 text-xs font-bold text-white transition-all hover:bg-orange-600"
              >
                Sell
              </button>
              <button
                onClick={() => onCancel(order.id, order.platform)}
                disabled={order.status === "Cancelled"}
                className={`h-12 rounded-2xl text-xs font-bold transition-all ${order.status === "Cancelled" ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
              >
                {order.status === "Cancelled" ? "Cancelled" : "Cancel"}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
