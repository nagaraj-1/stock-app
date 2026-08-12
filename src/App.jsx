import LiveStockPanel from "./components/LiveStockPanel";
import OrderForm from "./components/OrderForm";
import OrdersTable from "./components/OrdersTable";
import SettingsModal from "./components/SettingsModal";
import { useTradingOrders } from "./hooks/useTradingOrders";
import LiveResponse from "./components/LiveResponse";
import { Activity, Bot, Radio, Settings, Sparkles } from "lucide-react";
export default function App() {
  const { fields, actions, orders, showSettings, isLoadingStock, isNagAiActive,
    isCutieAiActive } = useTradingOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="color-orb absolute -left-40 -top-52 h-[34rem] w-[34rem] rounded-full bg-fuchsia-300/35 blur-3xl" />
        <div className="color-orb-delayed absolute -right-48 top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="color-orb absolute bottom-[-16rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-200/35 blur-3xl" />
        <div className="dashboard-grid absolute inset-0 opacity-70" />
      </div>

      <header className="sticky top-0 z-30 border-b border-violet-100/80 bg-white/75 shadow-[0_8px_30px_rgba(109,40,217,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-3 py-3 sm:px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-lg shadow-fuchsia-500/25">
              <Activity size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">PulseTrade</h1>
                <span className="rounded-full border border-fuchsia-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-1.5 py-0.5 text-[8px] font-extrabold tracking-widest text-fuchsia-600">PRO</span>
              </div>
              <p className="mt-0.5 hidden text-[10px] font-medium text-slate-400 sm:block">Live execution & intelligence desk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"/><span className="relative h-2 w-2 rounded-full bg-emerald-500"/></span>
              <span className="text-[9px] font-extrabold tracking-widest text-emerald-700">MARKET LIVE</span>
            </div>
            <button type="button" onClick={() => actions.setShowSettings(true)} aria-label="Open settings" className="grid h-9 w-9 place-items-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-500/25">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1800px] px-2.5 py-3 sm:px-5 sm:py-5 lg:px-6">
        {/* Loading Overlay */}
        {isLoadingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-7 py-6 shadow-2xl backdrop-blur-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-sm font-semibold text-slate-700">Loading...</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
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

      <aside className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/70 bg-slate-950/90 p-1.5 text-white shadow-2xl shadow-slate-900/25 backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        <div className="hidden items-center gap-1.5 px-2 text-[9px] font-bold tracking-widest text-slate-400 sm:flex"><Sparkles size={11}/> AI DESK</div>
        <button type="button" onClick={() => actions.setIsNagAiActiveMode(!isNagAiActive)} className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-extrabold transition ${isNagAiActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}><Bot size={13}/> NAG <span className={`h-1.5 w-1.5 rounded-full ${isNagAiActive ? "bg-emerald-300" : "bg-slate-600"}`}/></button>
        <button type="button" onClick={() => actions.setIsCutieAiActiveMode(!isCutieAiActive)} className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-extrabold transition ${isCutieAiActive ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}><Radio size={13}/> CUTIE <span className={`h-1.5 w-1.5 rounded-full ${isCutieAiActive ? "bg-emerald-300" : "bg-slate-600"}`}/></button>
      </aside>

      {showSettings && (
        <SettingsModal fields={fields} actions={actions} />
      )}
    </div>
  );
}
