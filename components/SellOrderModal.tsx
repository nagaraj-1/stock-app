"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee } from "lucide-react";
import { Order } from "@/types/order";

type SellOrderModalProps = {
  order: Order | null;
  sellAmount: string;
  sellPercentage: number;
  loading: boolean;
  onClose: () => void;
  onChangePercentage: (value: number) => void;
  onChangeAmount: (value: string) => void;
  onConfirm: () => void;
};

export default function SellOrderModal({
  order,
  sellAmount,
  sellPercentage,
  loading,
  onClose,
  onChangePercentage,
  onChangeAmount,
  onConfirm,
}: SellOrderModalProps) {
  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-slate-900">Sell Order</div>
                <div className="mt-1 text-sm text-slate-700">Confirm sell execution</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-100 p-4">
              <div className="text-xs text-slate-400">Symbol</div>
              <div className="mt-1 text-xl font-black">{order.symbol}</div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-600">Sell Amount</div>

              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold text-slate-600">Sell Percentage</div>
                <input
                  type="number"
                  value={sellPercentage}
                  onChange={(event) => onChangePercentage(Number(event.target.value))}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-lg font-bold outline-none transition-all focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(event) => onChangeAmount(event.target.value)}
                  onFocus={(event) => event.target.select()}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-lg font-bold outline-none transition-all focus:border-blue-500"
                />
              </div>

              <div className="mt-2 text-xs text-slate-400">Default auto calculated 17.3%</div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={onClose}
                className="h-14 flex-1 rounded-2xl bg-slate-200 font-bold text-slate-700 transition-all hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="h-14 flex-1 rounded-2xl bg-red-500 font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Sell"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
