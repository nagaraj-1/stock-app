import LiveStockPanel from "./components/LiveStockPanel";
import OrderForm from "./components/OrderForm";
import OrdersTable from "./components/OrdersTable";
import TradingHeader from "./components/TradingHeader";
import SettingsModal from "./components/SettingsModal";
import { useTradingOrders } from "./hooks/useTradingOrders";
import LiveResponse from "./components/LiveResponse";

export default function App() {
  const { fields, actions, orders, showSettings, isLoadingStock } = useTradingOrders();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
      {/* TradingHeader Full Width */}
      <header className="w-full">
        <TradingHeader
          onOpenSettings={() => actions.setShowSettings(true)}
          onExecuteOrder={actions.executeOrder}
        />
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Loading Overlay */}
        {isLoadingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-sm font-semibold text-slate-700">Loading stock...</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <LiveResponse user="NAG"/>
        </section>
         <section>
          <LiveResponse user="CUTIE"/>
        </section>

        </div>
      </main>

      {showSettings && (
        <SettingsModal fields={fields} actions={actions} />
      )}
    </div>
  );
}