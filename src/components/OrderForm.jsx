import React from "react";
import {
  TrendingUp,
  User,
  Percent,
  IndianRupee,
  Layers3,
  Zap
} from "lucide-react";

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 text-[11px] sm:text-xs font-bold text-slate-800 transition-all duration-300 placeholder:text-slate-400/80 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm text-center sm:text-left";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22292.4%22 height=%22292.4%22%3E%3Cpath fill=%22%23475569%22 d=%22M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:0.55rem_auto] bg-[right_0.4rem_center] bg-no-repeat sm:pr-8 cursor-pointer !px-1`;

function FormField({ label, icon, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
        <span className="text-slate-400/80">{icon}</span>
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
    <section className="w-full rounded-2xl bg-white border border-slate-100 p-2 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md">

      {/* ================= ULTRA COMPACT 2-LINE MOBILE VIEW ================= */}
      <div className="grid grid-cols-4 gap-1.5 sm:hidden">

        {/* --- LINE 1 --- */}
        <input
          type="text"
          placeholder="SYM"
          value={fields.symbol}
          onChange={(e) => actions.setSymbol(e.target.value.toUpperCase())}
          onFocus={handleFocus}
          className={`${inputClass} uppercase font-black text-indigo-700`}
        />

        <input
          type="number"
          placeholder="Price"
          value={fields.price}
          onChange={(e) => actions.setPrice(Number(e.target.value))}
          onFocus={handleFocus}
          className={inputClass}
        />

        <input
          type="number"
          placeholder="Top%"
          value={fields.topPercent}
          onChange={(e) => actions.setTopPercent(Number(e.target.value))}
          onFocus={handleFocus}
          className={inputClass}
        />

        <select
          value={fields.user}
          onChange={(e) => actions.setUser(e.target.value)}
          className={selectClass}
        >
          <option value="NAG">NAG</option>
          <option value="CUTIE">CUTIE</option>
        </select>

        {/* --- LINE 2 --- */}
        <input
          type="number"
          placeholder="Tgt%"
          value={fields.targetPercent}
          onChange={(e) => actions.setTargetPercent(Number(e.target.value))}
          onFocus={handleFocus}
          className={inputClass}
        />

        <input
          type="number"
          placeholder={fields.targetPrice || "Tgt ₹"}
          value={fields.manualTargetPrice}
          onChange={(e) => actions.setManualTargetPrice(e.target.value)}
          onFocus={handleFocus}
          className={`${inputClass} border-emerald-200 bg-emerald-50/50 text-emerald-800 focus:border-emerald-500`}
        />

        <input
          type="number"
          placeholder={fields.targetQty || "Qty"}
          value={fields.manualTargetQty}
          onChange={(e) => actions.setManualTargetQty(e.target.value)}
          onFocus={handleFocus}
          className={`${inputClass} border-indigo-200 bg-indigo-50/50 text-indigo-800 focus:border-indigo-500`}
        />

        <button
          type="button"
          onClick={onExecuteOrder}
          className="flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-black text-white shadow-md active:scale-95 transition-all"
        >
          <Zap size={10} className="fill-current" />
          EXEC
        </button>

      </div>

      {/* ================= DESKTOP VIEW (Unchanged) ================= */}
      <div className="hidden grid-cols-2 gap-3.5 sm:grid sm:grid-cols-4 xl:flex xl:flex-row xl:items-end xl:gap-2.5">

        <FormField label="Symbol" icon={<TrendingUp size={11} />} className="xl:flex-[1.4]">
          <input
            type="text"
            placeholder="RELIANCE"
            value={fields.symbol}
            onChange={(e) => actions.setSymbol(e.target.value.toUpperCase())}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3 uppercase tracking-wide font-black`}
          />
        </FormField>

        <FormField label="Price" icon={<IndianRupee size={11} />} className="xl:flex-1">
          <input
            type="number"
            placeholder="0.00"
            value={fields.price}
            onChange={(e) => actions.setPrice(Number(e.target.value))}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3 tracking-tight`}
          />
        </FormField>

        <FormField label="Top %" icon={<Percent size={11} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder="16"
            value={fields.topPercent}
            onChange={(e) => actions.setTopPercent(Number(e.target.value))}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3`}
          />
        </FormField>

        <FormField label="User" icon={<User size={11} />} className="xl:flex-[0.9]">
          <select
            value={fields.user}
            onChange={(e) => actions.setUser(e.target.value)}
            className={`${selectClass} !text-left sm:px-3`}
          >
            <option value="NAG">NAG</option>
            <option value="CUTIE">CUTIE</option>
          </select>
        </FormField>

        <FormField label="Target %" icon={<Percent size={11} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder="15.55"
            value={fields.targetPercent}
            onChange={(e) => actions.setTargetPercent(Number(e.target.value))}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3`}
          />
        </FormField>

        <FormField label="Target ₹" icon={<IndianRupee size={11} />} className="xl:flex-1">
          <input
            type="number"
            placeholder={fields.targetPrice}
            value={fields.manualTargetPrice}
            onChange={(e) => actions.setManualTargetPrice(e.target.value)}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3 border-emerald-200/80 bg-emerald-50/40 text-emerald-800 placeholder:text-emerald-400/90 focus:border-emerald-500`}
          />
        </FormField>

        <FormField label="Qty" icon={<Layers3 size={11} />} className="xl:flex-[0.8]">
          <input
            type="number"
            placeholder={fields.targetQty}
            value={fields.manualTargetQty}
            onChange={(e) => actions.setManualTargetQty(e.target.value)}
            onFocus={handleFocus}
            className={`${inputClass} !text-left sm:px-3 border-indigo-200/80 bg-indigo-50/40 text-indigo-800 placeholder:text-indigo-400/90 focus:border-indigo-500`}
          />
        </FormField>

        {/* Execute Button */}
        <div className="col-span-2 mt-2 sm:col-span-4 xl:col-span-1 xl:mt-0 xl:flex-[1.4]">
          <button
            type="button"
            onClick={onExecuteOrder}
            className="group relative flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-xs font-black tracking-wider text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] active:scale-95"
          >
            <Zap size={12} className="fill-current transition-transform duration-300 group-hover:scale-110" />
            <span>EXECUTE ORDER</span>
          </button>
        </div>

      </div>
    </section>
  );
}