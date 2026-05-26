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
  "h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-800 transition-all duration-300 placeholder:text-slate-400/80 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22292.4%22 height=%22292.4%22%3E%3Cpath fill=%22%23475569%22 d=%22M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:0.55rem_auto] bg-[right_0.75rem_center] bg-no-repeat pr-8 cursor-pointer`;

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
    <section className="w-full rounded-2xl bg-white border border-slate-100 p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md">

      {/* ================= MOBILE VIEW ================= */}
      <div className="grid grid-cols-4 gap-2 sm:hidden">

        {/* SYMBOL */}
        <FormField
          label="Symbol"
          icon={<TrendingUp size={10} />}
          className="col-span-2"
        >
          <input
            type="text"
            placeholder="RELIANCE"
            value={fields.symbol}
            onChange={(e) =>
              actions.setSymbol(e.target.value.toUpperCase())
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] uppercase rounded-lg font-black tracking-wide`}
          />
        </FormField>

        {/* PRICE */}
        <FormField
          label="Price"
          icon={<IndianRupee size={10} />}
        >
          <input
            type="number"
            placeholder="0"
            value={fields.price}
            onChange={(e) =>
              actions.setPrice(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] rounded-lg tracking-tight`}
          />
        </FormField>

        {/* TOP % */}
        <FormField
          label="Top %"
          icon={<Percent size={10} />}
        >
          <input
            type="number"
            placeholder="16"
            value={fields.topPercent}
            onChange={(e) =>
              actions.setTopPercent(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] rounded-lg`}
          />
        </FormField>

        {/* USER */}
        <FormField
          label="User"
          icon={<User size={10} />}
        >
          <select
            value={fields.user}
            onChange={(e) =>
              actions.setUser(e.target.value)
            }
            className={`${selectClass} h-9 px-2.5 text-[11px] rounded-lg font-bold`}
          >
            <option value="NAG">NAG</option>
            <option value="CUTIE">CUTIE</option>
          </select>
        </FormField>

        {/* TARGET % */}
        <FormField
          label="Tgt %"
          icon={<Percent size={10} />}
        >
          <input
            type="number"
            placeholder="15"
            value={fields.targetPercent}
            onChange={(e) =>
              actions.setTargetPercent(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] rounded-lg`}
          />
        </FormField>

        {/* TARGET PRICE */}
        <FormField
          label="Target ₹"
          icon={<IndianRupee size={10} />}
        >
          <input
            type="number"
            placeholder={fields.targetPrice}
            value={fields.manualTargetPrice}
            onChange={(e) =>
              actions.setManualTargetPrice(e.target.value)
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] rounded-lg border-emerald-200 bg-emerald-50/50 text-emerald-800 focus:border-emerald-500 focus:ring-emerald-500/10 placeholder:text-emerald-400`}
          />
        </FormField>

        {/* QTY */}
        <FormField
          label="Qty"
          icon={<Layers3 size={10} />}
        >
          <input
            type="number"
            placeholder={fields.targetQty}
            value={fields.manualTargetQty}
            onChange={(e) =>
              actions.setManualTargetQty(e.target.value)
            }
            onFocus={handleFocus}
            className={`${inputClass} h-9 px-2.5 text-[11px] rounded-lg border-indigo-200 bg-indigo-50/50 text-indigo-800 focus:border-indigo-500 focus:ring-indigo-500/10 placeholder:text-indigo-400`}
          />
        </FormField>

        {/* EXECUTE MOBILE */}
        <div className="col-span-4 mt-1">
          <button
            type="button"
            onClick={onExecuteOrder}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-extrabold text-white shadow-md active:scale-95 transition-all duration-150"
          >
            <Zap size={11} className="fill-current" />
            Execute Order
          </button>
        </div>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden grid-cols-2 gap-3.5 sm:grid sm:grid-cols-4 xl:flex xl:flex-row xl:items-end xl:gap-2.5">

        {/* Symbol */}
        <FormField
          label="Symbol"
          icon={<TrendingUp size={11} />}
          className="xl:flex-[1.4]"
        >
          <input
            type="text"
            placeholder="RELIANCE"
            value={fields.symbol}
            onChange={(e) =>
              actions.setSymbol(e.target.value.toUpperCase())
            }
            onFocus={handleFocus}
            className={`${inputClass} uppercase tracking-wide font-black focus:ring-indigo-500/10`}
          />
        </FormField>

        {/* Price */}
        <FormField
          label="Price"
          icon={<IndianRupee size={11} />}
          className="xl:flex-1"
        >
          <input
            type="number"
            placeholder="0.00"
            value={fields.price}
            onChange={(e) =>
              actions.setPrice(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={`${inputClass} tracking-tight`}
          />
        </FormField>

        {/* Top Percent */}
        <FormField
          label="Top %"
          icon={<Percent size={11} />}
          className="xl:flex-[0.8]"
        >
          <input
            type="number"
            placeholder="16"
            value={fields.topPercent}
            onChange={(e) =>
              actions.setTopPercent(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={inputClass}
          />
        </FormField>

        {/* User */}
        <FormField
          label="User"
          icon={<User size={11} />}
          className="xl:flex-[0.9]"
        >
          <select
            value={fields.user}
            onChange={(e) =>
              actions.setUser(e.target.value)
            }
            className={selectClass}
          >
            <option value="NAG">NAG</option>
            <option value="CUTIE">CUTIE</option>
          </select>
        </FormField>

        {/* Target Percent */}
        <FormField
          label="Target %"
          icon={<Percent size={11} />}
          className="xl:flex-[0.8]"
        >
          <input
            type="number"
            placeholder="15.55"
            value={fields.targetPercent}
            onChange={(e) =>
              actions.setTargetPercent(Number(e.target.value))
            }
            onFocus={handleFocus}
            className={inputClass}
          />
        </FormField>

        {/* Target Price */}
        <FormField
          label="Target ₹"
          icon={<IndianRupee size={11} />}
          className="xl:flex-1"
        >
          <input
            type="number"
            placeholder={fields.targetPrice}
            value={fields.manualTargetPrice}
            onChange={(e) =>
              actions.setManualTargetPrice(e.target.value)
            }
            onFocus={handleFocus}
            className={`${inputClass} border-emerald-200/80 bg-emerald-50/40 text-emerald-800 placeholder:text-emerald-400/90 focus:border-emerald-500 focus:ring-emerald-500/10`}
          />
        </FormField>

        {/* Qty */}
        <FormField
          label="Qty"
          icon={<Layers3 size={11} />}
          className="xl:flex-[0.8]"
        >
          <input
            type="number"
            placeholder={fields.targetQty}
            value={fields.manualTargetQty}
            onChange={(e) =>
              actions.setManualTargetQty(e.target.value)
            }
            onFocus={handleFocus}
            className={`${inputClass} border-indigo-200/80 bg-indigo-50/40 text-indigo-800 placeholder:text-indigo-400/90 focus:border-indigo-500 focus:ring-indigo-500/10`}
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