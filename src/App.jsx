import LiveStockPanel from "./components/LiveStockPanel";
import OrderForm from "./components/OrderForm";
import OrdersTable from "./components/OrdersTable";
import TradingHeader from "./components/TradingHeader";
import SettingsModal from "./components/SettingsModal";
import { useTradingOrders } from "./hooks/useTradingOrders";
import { LineChart, Activity } from "lucide-react";
import Grow from "./components/Grow";

export default function App() {
  const { fields, actions, orders, showSettings, isLoadingStock } = useTradingOrders();

  return (
    <main className=" bg-[#f8fafc] text-slate-900 antialiased flex flex-col">
      <TradingHeader
        onOpenSettings={() => actions.setShowSettings(true)}
        onExecuteOrder={actions.executeOrder}
      />
aa{orders.length}
      {isLoadingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>

            <p className="text-sm font-semibold text-slate-700">
              Loading stock...
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-y-auto lg:overflow-hidden">
        {/* Top-Left: Order Execution (OrderForm) */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <OrderForm
            fields={fields}
            actions={actions}
            
            onExecuteOrder={actions.executeOrder}
          />
        </section>

        {/* Top-Right: Live Stock Panel */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <LiveStockPanel onSelectStock={actions.selectStock} />
        </section>

        {/* Bottom-Left: Orders List (OrdersTable) */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <OrdersTable orders={orders} onCancelOrder={actions.calcelOrders} onTrackOrder={actions.aiModeOrderTrack} />
        </section>

        {/* Bottom-Right: Live Feed Coming Soon */}
        <section className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 text-center transition-colors hover:bg-slate-50/50">
         
          <Grow />
        </section>
      </div>

      {showSettings && (
        <SettingsModal fields={fields} actions={actions} />
      )}
    </main>
  );
}
