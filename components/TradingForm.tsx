"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
    Loader2,
    IndianRupee,
} from "lucide-react";

import SelectBox from "./SelectBox";
import PlatformSelect from "./PlatformSelect";

import {
    users,
    platforms,
} from "@/data/constants";

export default function TradingForm({
    setOrders,
    investmentSettings,
}: any) {
    const [symbol, setSymbol] =
        useState("RELIANCE");

    const [price, setPrice] =
        useState(2450);

    const [percentage, setPercentage] =
        useState(16);

    const [selectedUser, setSelectedUser] =
        useState("Alex");

    const [
        selectedPlatform,
        setSelectedPlatform,
    ] = useState("Groww");

    const [loading, setLoading] =
        useState(false);

    /* =========================
       EXECUTE ORDER
    ========================= */

    const executeOrder = async () => {
        try {

            setLoading(true);

            // ====================================
            // INVESTMENT
            // ====================================

            const amount =
                investmentSettings[
                `${selectedUser}-${selectedPlatform}`
                ];

            // ====================================
            // BROKERAGE
            // ====================================
            const targetPercentage = 15.51;

            const finalPrice = Number(
                (
                    (price / (1 + percentage / 100)) *
                    (1 + targetPercentage / 100)
                ).toFixed(2)
            );

            console.log(finalPrice);

            // ====================================
            // QTY
            // ====================================

            const qty = Math.floor(
                amount / (finalPrice / 5)
            );

            console.log("==========");

            console.log("SYMBOL:", symbol);

            console.log("PRICE:", price);

            console.log(
                "FINAL PRICE:",
                finalPrice
            );

            console.log("QTY:", qty);

            console.log("==========");

            // ====================================
            // PLACE ORDER API
            // ====================================

            const response = await fetch(
                "http://127.0.0.1:8000/execute-order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        action: "BUY",

                        symbol,

                        qty,

                        price: Number(
                            finalPrice.toFixed(2)
                        ),

                        platform:
                            selectedPlatform,
                    }),
                }
            );

            const data =
                await response.json();

            console.log(data);

            // ====================================
            // ORDER ID
            // ====================================

            const backendOrderId =
                data.order_id ||
                `ORD-${Math.floor(
                    Math.random() * 999999
                )}`;

            // ====================================
            // DATE TIME
            // ====================================

            const now = new Date();

            // ====================================
            // FRONTEND ORDER
            // ====================================

            const order = {
                id: backendOrderId,

                symbol,

                qty,

                price: Number(finalPrice.toFixed(2)),

                finalPrice: Number(
                    finalPrice.toFixed(2)
                ),

                user: selectedUser,

                platform: selectedPlatform,

                amount,

                percentage:
                    targetPercentage.toFixed(2),

                status: "Executed",

                date:
                    now.toLocaleDateString(),

                time:
                    now.toLocaleTimeString(),
            };

            // ====================================
            // UPDATE UI
            // ====================================

            setOrders((prev: any) => [
                order,
                ...prev,
            ]);

            setLoading(false);

        } catch (error) {

            console.error(error);

            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
        >
            {/* GRID */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* SYMBOL */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-500">
                        Trading Symbol
                    </label>

                    <input
                        value={symbol}
                        onClick={(e) =>
                            e.currentTarget.select()
                        }
                        onFocus={(e) =>
                            e.currentTarget.select()
                        }
                        onChange={(e) =>
                            setSymbol(
                                e.target.value.toUpperCase()
                            )
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-lg font-semibold outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    />
                </div>

                {/* PRICE */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-500">
                        Current Price
                    </label>

                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                            type="number"
                            value={price}
                            onClick={(e) =>
                                e.currentTarget.select()
                            }
                            onFocus={(e) =>
                                e.currentTarget.select()
                            }
                            onChange={(e) =>
                                setPrice(
                                    Number(e.target.value)
                                )
                            }
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-5 text-lg font-bold outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {/* PERCENTAGE */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-500">
                        Current %
                    </label>

                    <input
                        type="number"
                        value={percentage}
                        onClick={(e) =>
                            e.currentTarget.select()
                        }
                        onFocus={(e) =>
                            e.currentTarget.select()
                        }
                        onChange={(e) =>
                            setPercentage(
                                Number(e.target.value)
                            )
                        }
                        className={`h-14 w-full rounded-2xl border px-5 text-lg font-bold outline-none transition-all duration-300 focus:ring-4 ${percentage >= 0
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600 focus:ring-emerald-500/20"
                            : "border-red-300 bg-red-50 text-red-600 focus:ring-red-500/20"
                            }`}
                    />
                </div>

                {/* USER */}
                <SelectBox
                    label="Select User"
                    value={selectedUser}
                    options={users}
                    onChange={setSelectedUser}
                />

                {/* PLATFORM */}
                <PlatformSelect
                    label="Select Platform"
                    value={selectedPlatform}
                    options={platforms}
                    onChange={setSelectedPlatform}
                />
            </div>

            {/* BUTTON */}
            <div className="mt-6">
                <motion.button
                    whileHover={{
                        scale: 1.02,
                    }}
                    whileTap={{
                        scale: 0.96,
                    }}
                    onClick={executeOrder}
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-xl transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Executing
                        </>
                    ) : (
                        "Execute Order"
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}