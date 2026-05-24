import React from "react";
import {
  TrendingUp,
  User,
  Percent,
  IndianRupee,
  Layers3,
  Zap
} from "lucide-react";

// Sleeker, more compact input class optimized for both mobile touch and desktop rows
const inputClass =
  "h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 outline-none";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22292.4%22 height=%22292.4%22%3E%3Cpath fill=%22%2364748B%22 d=%22M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:0.6rem_auto] bg-[right_1rem_center] bg-no-repeat pr-8`;

function FormField({ label, icon, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
        <span className="text-indigo-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function OrderFormModern({
  fields,
  actions,
  onExecuteOrder,
}) {
  const handleFocus = (e) => e.target.select();

  return (
    <section className="w-full rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 sm:p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
      
      {/* Header - Compact and modern */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Smart Execution
            </h2>
            
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="text-[10px] font-bold tracking-wide text-emerald-700">
            LIVE
          </span>
        </div>
      </div>

      {/* 
        Responsive Layout Container: 
        Mobile: 2 Columns 
        Tablet: 4 Columns 
        Desktop (xl): Single Row using Flex-1 
      */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:flex xl:flex-row xl:items-end xl:gap-2.5">
        
        {/* Symbol */}
        <FormField label="Symbol" icon={<TrendingUp size={12} />} className="xl:flex-[1.5]">
          <input
            type="text"
            placeholder="RELIANCE"
            value={fields.symbol}
            onChange={(e) => actions.setSymbol(e.target.value.toUpperCase())}
            onFocus={handleFocus}
            className={`${inputClass} uppercase`}
          />
        </FormField>

        {/* Price */}
        <FormField label="Price" icon={<IndianRupee size={12} />} className="xl:flex-1">
          <input
            type="number"
            placeholder="0.00"
            value={fields.price}
            onChange={(e) => actions.setPrice(Number(e.target.value))}
            onFocus={handleFocus}
            className={inputClass}
          />
        </FormField>

        {/* Top Percent */}
        <FormField label="Top %" icon={<Percent size={12} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder="16"
            value={fields.topPercent}
            onChange={(e) => actions.setTopPercent(Number(e.target.value))}
            onFocus={handleFocus}
            className={inputClass}
          />
        </FormField>

        {/* User */}
        <FormField label="User" icon={<User size={12} />} className="xl:flex-[0.9]">
          <select
            value={fields.user}
            onChange={(e) => actions.setUser(e.target.value)}
            className={selectClass}
          >
            <option value="NAG">NAG</option>
            <option value="CUTIE">CUTIE</option>
          </select>
        </FormField>

        {/* Target Percent */}
        <FormField label="Target %" icon={<Percent size={12} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder="15.55"
            value={fields.targetPercent}
            onChange={(e) => actions.setTargetPercent(Number(e.target.value))}
            onFocus={handleFocus}
            className={inputClass}
          />
        </FormField>

        {/* Target Price */}
        <FormField label="Target ₹" icon={<IndianRupee size={12} />} className="xl:flex-1">
          <input
            type="number"
            placeholder={fields.targetPrice}
            value={fields.manualTargetPrice}
            onChange={(e) => actions.setManualTargetPrice(e.target.value)}
            onFocus={handleFocus}
            className={`${inputClass} border-emerald-200/80 bg-emerald-50/50 text-emerald-800 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15`}
          />
        </FormField>

        {/* Qty */}
        <FormField label="Qty" icon={<Layers3 size={12} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder={fields.targetQty}
            value={fields.manualTargetQty}
            onChange={(e) => actions.setManualTargetQty(e.target.value)}
            onFocus={handleFocus}
            className={`${inputClass} border-indigo-200/80 bg-indigo-50/50 text-indigo-800 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/15`}
          />
        </FormField>

        {/* Execute Button */}
        <div className="col-span-2 mt-2 sm:col-span-4 xl:col-span-1 xl:mt-0 xl:flex-[1.2]">
          <button
            type="button"
            onClick={onExecuteOrder}
            className="group relative flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
            Execute Order
          </button>
        </div>
        
      </div>
    </section>
  );
}