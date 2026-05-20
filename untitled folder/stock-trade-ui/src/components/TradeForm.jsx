import { useMemo, useState, useEffect } from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Hash,
  Percent,
  Target,
  Wallet,
  Zap,
} from "lucide-react";

function FieldLabel({ children, icon: Icon }) {
  return (
    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
      <Icon size={14} className="text-cyan-400" />
      {children}
    </label>
  );
}

function MetricInput({
  label,
  value,
  onChange,
  color,
  type = "number",
  step,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <input
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        className={`mt-1 w-full bg-transparent text-lg font-black ${color} outline-none`}
      />
    </div>
  );
}

export default function TradeForm({
  symbol,
  setSymbol,
  price,
  setPrice,
  setTargetPrice,
  setQty,
  handleBuy,
  handleSell,
}) {

  // =========================================
  // PERCENTAGES
  // =========================================

  const [defaultPercentage, setDefaultPercentage] = useState(16);

  const [targetPercentage, setTargetPercentage] = useState(15.51);

  // =========================================
  // MANUAL OVERRIDES
  // =========================================

  const [manualTargetPrice, setManualTargetPrice] = useState("");

  const [manualQty, setManualQty] = useState("");

  // =========================================
  // INVESTMENT TYPE
  // =========================================

  const [investmentType, setInvestmentType] = useState("NAG");

  // =========================================
  // BUDGET
  // =========================================

  const budget = (() => {

    const storageKey =
      `${investmentType.toLowerCase()}_investment`;

    const savedBudget =
      typeof window !== "undefined"
        ? localStorage.getItem(storageKey)
        : null;

    return savedBudget
      ? parseFloat(savedBudget)
      : 0;

  })();

  // =========================================
  // MARKET PRICE
  // =========================================

  const marketPrice = Number(price || 0);

  // =========================================
  // TARGET PRICE FORMULA
  // Excel:
  // =ROUND((B2 / (1 + (C2 / 100))) * (1 + (C3 / 100)), 2)
  // =========================================

  const calculatedTargetPrice = useMemo(() => {

    if (!marketPrice) return "";

    const calculatedPrice =
      (marketPrice /
        (1 + (defaultPercentage / 100))) *
      (1 + (targetPercentage / 100));

    return Number(
      calculatedPrice.toFixed(2)
    );

  }, [
    marketPrice,
    defaultPercentage,
    targetPercentage,
  ]);

  // =========================================
  // FINAL TARGET PRICE
  // =========================================

  const finalTargetPrice =
    manualTargetPrice !== ""
      ? manualTargetPrice
      : calculatedTargetPrice;

  // =========================================
  // TARGET PRICE NUMBER
  // =========================================

  const targetPriceNumber =
    Number(finalTargetPrice || 0);

  // =========================================
  // AUTO QTY
  // =========================================

  const autoQty =
    targetPriceNumber && budget
      ? Math.floor(
          budget / targetPriceNumber
        )
      : 0;

  // =========================================
  // FINAL QTY
  // =========================================

  const finalQty =
    manualQty !== ""
      ? parseInt(manualQty, 10) || 0
      : autoQty;

  // =========================================
  // UPDATE PARENT STATE
  // =========================================

  useEffect(() => {

    setTargetPrice(finalTargetPrice);

  }, [finalTargetPrice]);

  useEffect(() => {

    setQty(finalQty);

  }, [finalQty]);

  // =========================================
  // CALCULATIONS
  // =========================================

  
  const estimatedValue =
    targetPriceNumber && finalQty
      ? targetPriceNumber * finalQty
      : 0;

  const budgetUsed = budget
    ? Math.min(
        (estimatedValue / budget) * 100,
        100
      )
    : 0;

  const formattedBudget =
    budget.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  // =========================================
  // PAYLOAD
  // =========================================

  const tradePayload = {
    symbol,
    qty: Number(finalQty) || 0,
    price: Number(finalTargetPrice) || 0,
  };

  return (
    <div className="w-full max-w-sm md:max-w-6xl mx-auto">

      <div className="rounded-[2rem] border border-white/10 bg-slate-950 p-4 md:p-6">

        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">

              <Activity size={15} />

              Trade Console

            </div>

            <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">

              {symbol || "SELECT SYMBOL"}

            </h2>

          </div>

          <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.06] p-1">

            {["NAG", "CUTIE"].map((type) => (

              <button
                key={type}
                type="button"
                onClick={() => setInvestmentType(type)}
                className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                  investmentType === type
                    ? "bg-white text-slate-950"
                    : "text-slate-400"
                }`}
              >
                {type}
              </button>

            ))}

          </div>

        </div>

        {/* MAIN */}

        <div className="grid gap-4 md:grid-cols-12">

          {/* LEFT */}

          <div className="md:col-span-8">

            <div className="grid gap-4 md:grid-cols-2">

              {/* SYMBOL */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">

                <FieldLabel icon={Hash}>
                  Symbol
                </FieldLabel>

                <input
                  value={symbol}
                  onChange={(e) => {

                    setSymbol(
                      e.target.value.toUpperCase()
                    );

                    setManualTargetPrice("");
                    setManualQty("");

                  }}
                  placeholder="RELIANCE"
                  className="mt-3 w-full bg-transparent text-4xl font-black uppercase text-white outline-none"
                />

              </div>

              {/* MARKET PRICE */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">

                <FieldLabel icon={Target}>
                  Market Price
                </FieldLabel>

                <div className="mt-3 flex items-baseline gap-2">

                  <span className="text-2xl font-black text-slate-500">
                    ₹
                  </span>

                  <input
                    value={price}
                    onChange={(e) => {

                      setPrice(e.target.value);

                      setManualTargetPrice("");
                      setManualQty("");

                    }}
                    placeholder="0.00"
                    type="number"
                    className="w-full bg-transparent text-4xl font-black text-white outline-none"
                  />

                </div>

              </div>

            </div>

            {/* METRICS */}

            <div className="mt-4 grid gap-4 md:grid-cols-3">

              {/* BUDGET */}

              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">

                <FieldLabel icon={Wallet}>
                  Budget
                </FieldLabel>

                <div className="mt-2 text-2xl font-black text-white">

                  ₹{formattedBudget}

                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{
                      width: `${budgetUsed}%`,
                    }}
                  />

                </div>

              </div>

              {/* DEFAULT % */}

              <MetricInput
                label="Default %"
                value={defaultPercentage}
                onChange={(e) =>
                  setDefaultPercentage(
                    Number(e.target.value)
                  )
                }
                step="0.01"
                color="text-violet-300"
              />

              {/* TARGET % */}

              <MetricInput
                label="Calc %"
                value={targetPercentage}
                onChange={(e) => {

                  setTargetPercentage(
                    Number(e.target.value)
                  );

                  setManualTargetPrice("");
                  setManualQty("");

                }}
                step="0.01"
                color="text-amber-300"
              />

            </div>

            {/* BUTTONS */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  handleBuy(tradePayload)
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-emerald-950"
              >

                <ArrowUpRight size={18} />

                Buy

              </button>

              <button
                onClick={() =>
                  handleSell(tradePayload)
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
              >

                <ArrowDownRight size={18} />

                Sell

              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="md:col-span-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">

                    Live Workspace

                  </div>

                  <div className="mt-1 text-sm font-bold text-slate-300">

                    Target order preview

                  </div>

                </div>

                <Zap
                  size={19}
                  className="text-amber-300"
                />

              </div>

              <div className="grid gap-3">

                {/* QTY */}

                <MetricInput
                  label="Quantity"
                  value={finalQty}
                  onChange={(e) =>
                    setManualQty(
                      e.target.value
                    )
                  }
                  color="text-cyan-300"
                />

                {/* TARGET PRICE */}

                <MetricInput
                  label="Target Buy"
                  value={finalTargetPrice}
                  onChange={(e) => {

                    setManualTargetPrice(
                      e.target.value
                    );

                    setManualQty("");

                  }}
                  step="0.01"
                  color="text-emerald-300"
                />


              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}