import LiveStockPanel from "./components/LiveStockPanel";
import OrderForm from "./components/OrderForm";
import OrdersTable from "./components/OrdersTable";
import TradingHeader from "./components/TradingHeader";
import SettingsModal from "./components/SettingsModal";
import { useTradingOrders } from "./hooks/useTradingOrders";
import LiveResponse from "./components/LiveResponse";
import { Brain } from "lucide-react";
import { Settings } from "lucide-react";
export default function App() {
  const { fields, actions, orders, showSettings, isLoadingStock, isNagAiActive,
    isCutieAiActive, pendingPopup } = useTradingOrders();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
      {/* FIXED SETTINGS BUTTON */}
      <div className="group fixed right-0 top-[20%] z-50">
        <button
          type="button"
          onClick={() => actions.setShowSettings(true)}
          className="translate-x-[30%] rounded-l-lg border border-r-0 border-slate-200 bg-white p-2 text-slate-600 shadow-md transition-all duration-300 hover:translate-x-0 hover:bg-slate-50"
        >
          <Settings size={14} />
        </button>
      </div>


      {/* RIGHT FLOATING AI BUTTONS */}
      <div className="group fixed right-0 top-[25%] z-40">
        <div className="translate-x-[50%] transition-transform duration-300 group-hover:translate-x-0">
          <button
            type="button"
            onClick={() =>
              actions.setIsNagAiActiveMode(!isNagAiActive)
            }
            className={`flex items-center gap-1 rounded-l-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${isNagAiActive
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-500 border border-slate-200"
              }`}
          >
            N-AI
          </button>
        </div>
      </div>


      <div className="group fixed right-0 top-[30%] z-40">
        <div className="translate-x-[50%] transition-transform duration-300 group-hover:translate-x-0">
          <button
            type="button"
            onClick={() =>
              actions.setIsCutieAiActiveMode(
                !isCutieAiActive
              )
            }
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${isCutieAiActive
              ? "bg-pink-600 text-white shadow-md"
              : "bg-white text-slate-500 border border-slate-200"
              }`}
          >


            C-AI
          </button>
        </div>
      </div>



      <main className=" space-y-6">
        {/* Loading Overlay */}
        {isLoadingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-sm font-semibold text-slate-700">Loading...</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Top Row: Form and Stock Panel */}
          <div className="lg:col-span-2">
            <OrderForm
              fields={fields}
              actions={actions}
              onExecuteOrder={actions.executeOrder}
            />
          </div>

          <section>
            <LiveStockPanel onSelectStock={actions.selectStock} />
          </section>

          <section>
            <OrdersTable
              orders={orders}
              onCancelOrder={actions.calcelOrders}
              onSellOrder={actions.sellOrder}
              onTrackOrder={actions.aiModeOrderTrack}
              onStopTrackOrder={actions.stopTracking}
            />
          </section>


          {/* Bottom Section: Orders Table */}
          <section>
            <LiveResponse user="NAG" />
          </section>
          <section>
            <LiveResponse user="CUTIE" />
          </section>

        </div>
      </main>

      {showSettings && (
        <SettingsModal fields={fields} actions={actions} />
      )}
    </div>
  );
}