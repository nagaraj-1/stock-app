import { Order } from "@/types/order";
import { Monitor, Ban, ShoppingCart, User as UserIcon, Globe, Clock } from "lucide-react";

type OrderTableDesktopProps = {
  orders: Order[];
  onAiTrack: (order: Order) => void;
  onStop: (orderId: string) => void;
  onSell: (order: Order) => void;
  onCancel: (id: string, platform: string) => void;
};

const statusClasses = {
  Executed: "bg-emerald-100 text-emerald-600",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrderTableDesktop({
  orders,
  onAiTrack,
  onStop,
  onSell,
  onCancel,
}: OrderTableDesktopProps) {
  return (
    <div className="hidden overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-2xl backdrop-blur-xl lg:block">
      <div className="max-h-[700px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl">
            <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
              <th className="px-6 py-5">Order ID</th>
              <th className="px-6 py-5">Symbol</th>
              <th className="px-6 py-5">Qty</th>
              <th className="px-6 py-5">User</th>
              <th className="px-6 py-5">Platform</th>
              <th className="px-6 py-5">Amount</th>
              <th className="px-6 py-5">%</th>
              <th className="px-6 py-5">Time</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-5 font-mono text-sm font-bold">{order.id}</td>
                <td className="px-6 py-5 font-bold">{order.symbol}</td>
                <td className="px-6 py-5">{order.qty}</td>
                <td className="px-6 py-5">{order.user}</td>
                <td className="px-6 py-5">{order.platform}</td>
                <td className="px-6 py-5 font-bold">₹{order.price}</td>
                <td className={`px-6 py-5 font-bold ${Number(order.percentage) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {order.percentage}%
                </td>
                <td className="px-6 py-5">{order.time}</td>
                <td className="px-6 py-5">
                  <div className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${statusClasses[order.status]}`}>
                    {order.status}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAiTrack(order)}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-violet-700"
                    >
                      AI Mode
                    </button>
                    <button
                      onClick={() => onStop(order.id)}
                      className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white"
                    >
                      Stop
                    </button>
                    <button
                      onClick={() => onSell(order)}
                      className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-600"
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => onCancel(order.id, order.platform)}
                      disabled={order.status === "Cancelled"}
                      className={`rounded-xl px-4 py-2 text-sm font-bold ${order.status === "Cancelled" ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
