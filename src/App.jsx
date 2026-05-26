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
      <button
        type="button"
        onClick={() => actions.setShowSettings(true)}
        className="fixed right-0 top-[5%] z-50 flex h-8 w-8 items-center justify-center rounded-l-lg border border-r-0 border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50"
      >
        <Settings size={14} />
      </button>
      {/* Pending Order Popup */}
      {/* Pending Order Popup */}
      {pendingPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[380px] rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800">
              Trigger Pending
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Stock{" "}
              <span className="font-bold text-red-600">
                {pendingPopup.stockSymbol}
              </span>{" "}
              already has pending order.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              No response within 10 seconds →
              auto cancel old order and continue AI mode.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={pendingPopup.onSkip}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-white font-semibold hover:bg-red-600"
              >
                Skip AI Mode
              </button>

              <button
                onClick={pendingPopup.onContinue}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="w-full border-b border-slate-200 bg-white px-3 py-2">

        {/* RIGHT FLOATING AI BUTTONS */}
        <div className="fixed right-2 top-[0%] z-40 flex items-center gap-1.5">

          {/* NAG AI */}
          <button
            type="button"
            onClick={() =>
              actions.setIsNagAiActive(
                !isNagAiActive
              )
            }
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${isNagAiActive
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200"
              }`}
          >
            <Brain
              size={12}
              className={
                isNagAiActive
                  ? "animate-pulse"
                  : ""
              }
            />

            N-AI
          </button>

          {/* CUTIE AI */}
          <button
            type="button"
            onClick={() =>
              actions.setIsCutieAiActive(
                !isCutieAiActive
              )
            }
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${isCutieAiActive
                ? "bg-pink-600 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200"
              }`}
          >
            <Brain
              size={12}
              className={
                isCutieAiActive
                  ? "animate-pulse"
                  : ""
              }
            />

            C-AI
          </button>

        </div>

      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
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