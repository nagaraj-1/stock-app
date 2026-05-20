import { useState } from "react";
import { RefreshCcw, Settings } from "lucide-react";

import TradeForm from "../components/TradeForm";
import OrderTable from "../components/OrderTable";
import SettingsModal from "../components/SettingsModal";

import {
  getOrders,
  buyStock,
  sellStock,
  cancelOrder,
} from "../services/tradingApi";

export default function Home() {

  const [symbol, setSymbol] = useState("RELIANCE");
  const [price, setPrice] = useState("1500");
  const [targetPrice, setTargetPrice] = useState("0");
  const [qty, setQty] = useState(0);

  const [percentage, setPercentage] = useState("16%");

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadOrders = async () => {

    try {

      setLoading(true);

      const data = await getOrders();

      setOrders(data.orders || []);

    } catch (error) {

      alert("Failed to load orders");

    } finally {

      setLoading(false);
    }
  };

  const handleBuy = async () => {
    await buyStock({
      symbol,
      qty,
      price:targetPrice,
    });

    loadOrders();
  };

  const handleSell = async () => {

    await sellStock({
      symbol,
      qty,
      price:targetPrice,
    });

    loadOrders();
  };

  const handleCancel = async (orderId) => {

    await cancelOrder(orderId);

    loadOrders();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold text-white">
            Trading Dashboard
          </h1>

          <div className="flex gap-3">

            <button
              onClick={loadOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <RefreshCcw
                size={18}
                className={loading ? "animate-spin" : ""}
              />

              Sync Kite
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="bg-slate-800 border border-slate-700 p-3 rounded-xl"
            >
              <Settings className="text-white" />
            </button>

          </div>

        </div>

        <TradeForm
          symbol={symbol}
          setSymbol={setSymbol}
          price={price}
          setPrice={setPrice}
         setTargetPrice={setTargetPrice}
         setQty={setQty}
          percentage={percentage}
          setPercentage={setPercentage}
          handleBuy={handleBuy}
          handleSell={handleSell}
        />

        <div className="mt-8">

          <OrderTable
           price={price}
            orders={orders}
            handleCancel={handleCancel}
          />

        </div>

      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

    </div>
  );
}