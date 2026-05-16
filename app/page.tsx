"use client";

import { useState } from "react";

import Header from "@/components/Header";
import TradingForm from "@/components/TradingForm";
import OrderTable from "@/components/OrderTable";
import SettingsModal from "@/components/SettingsModal";

import { Order } from "@/types/order";

export default function Home() {
  const [showSettings, setShowSettings] =
    useState(false);

  const [orders, setOrders] = useState<
    Order[]
  >([]);

  const [
    investmentSettings,
    setInvestmentSettings,
  ] = useState<Record<string, number>>({
    "Alex-Groww": 1500,
    "Alex-Kite": 3000,
    "Alex-AngelOne": 2000,

    "Peter-Groww": 5000,
    "Peter-Kite": 7000,
    "Peter-AngelOne": 4000,

    "John-Groww": 10000,
    "John-Kite": 15000,
    "John-AngelOne": 12000,
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <Header
        onSettings={() =>
          setShowSettings(true)
        }
      />

      <TradingForm
        setOrders={setOrders}
        investmentSettings={
          investmentSettings
        }
      />

      <OrderTable
        orders={orders}
        setOrders={setOrders}
      />

      <SettingsModal
        open={showSettings}
        onClose={() =>
          setShowSettings(false)
        }
        investmentSettings={
          investmentSettings
        }
        setInvestmentSettings={
          setInvestmentSettings
        }
      />
    </div>
  );
}