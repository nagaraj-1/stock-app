"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import TradingForm from "@/components/TradingForm";
import OrderTable from "@/components/OrderTable";
import SettingsModal from "@/components/SettingsModal";

import { Order } from "@/types/order";
import { INVESTMENT_SETTINGS_URL } from "@/config/api";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [investmentSettings, setInvestmentSettings] = useState<Record<string, number>>({});
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const loadInvestmentSettings = async () => {
      if (typeof window === "undefined") return;

      try {
        const response = await fetch(INVESTMENT_SETTINGS_URL);
        if (!response.ok) {
          console.warn("Unable to load investment settings from API:", response.statusText);
          return;
        }

        const json = await response.json();
        setInvestmentSettings(json);
      } catch (error) {
        console.warn("Unable to load investment settings from API:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    loadInvestmentSettings();
  }, []);

  const saveInvestmentSettings = async (nextSettings: Record<string, number>) => {
    try {
      const response = await fetch(INVESTMENT_SETTINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });

      const data = await response.json();
      if (!response.ok || data.status === "error") {
        console.warn("Unable to save investment settings to API:", data.message || response.statusText);
        return;
      }

      setInvestmentSettings(nextSettings);
    } catch (error) {
      console.warn("Unable to save investment settings to API:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl"
        >
          <Settings className="h-6 w-6 text-slate-900" />
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl"
        >
          <Link href="/credentials" className="flex h-full w-full items-center justify-center text-slate-900">
            <span className="text-lg font-black">C</span>
          </Link>
        </motion.div>
      </div>

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
        onClose={() => setShowSettings(false)}
        investmentSettings={investmentSettings}
        onSave={saveInvestmentSettings}
      />
    </div>
  );
}