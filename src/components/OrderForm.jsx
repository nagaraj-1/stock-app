import FormField from "./FormField";

const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22292.4%22 height=%22292.4%22%3E%3Cpath fill=%22%2364748B%22 d=%22M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:0.5rem_auto] bg-[right_0.75rem_center] bg-no-repeat pr-8`;

const readOnlyClass =
  "h-10 w-full min-w-0 rounded-lg px-3 text-sm font-bold outline-none shadow-inner border border-transparent";

export default function OrderForm({
  fields,
  actions,
  onExecuteOrder,
}) {
  return (
    <section className="w-full overflow-hidden rounded-2xl bg-white p-3 md:p-4 shadow-lg">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
          Order Execution
        </h2>

        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="h-2 w-2 rounded-full bg-slate-200"></span>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        <FormField label="Symbol">
          <input
            type="text"
            placeholder="RELIANCE"
            value={fields.symbol}
            onChange={(event) =>
              actions.setSymbol(event.target.value.toUpperCase())
            }
            className={`${inputClass} uppercase`}
          />
        </FormField>

        <FormField label="Price">
          <input
            type="number"
            placeholder="0.00"
            value={fields.price}
            onChange={(event) =>
              actions.setPrice(Number(event.target.value))
            }
            className={inputClass}
          />
        </FormField>

        <FormField label="Top %">
          <input
            type="number"
            placeholder="16"
            value={fields.topPercent}
            onChange={(event) =>
              actions.setTopPercent(Number(event.target.value))
            }
            className={inputClass}
          />
        </FormField>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-slate-100"></div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

        <FormField label="User">
          <select
            value={fields.user}
            onChange={(event) =>
              actions.setUser(event.target.value)
            }
            className={selectClass}
          >
            <option value="NAG">NAG</option>
            <option value="CUTIE">CUTIE</option>
          </select>
        </FormField>

        <FormField label="Target %">
          <input
            type="number"
            placeholder="15.55"
            value={fields.targetPercent}
            onChange={(event) =>
              actions.setTargetPercent(Number(event.target.value))
            }
            className={inputClass}
          />
        </FormField>

        <FormField label="Target Price">
          <input
            type="number"
            placeholder={fields.targetPrice}
            value={fields.manualTargetPrice}
            onChange={(e) => actions.setManualTargetPrice(e.target.value)}
            className={`${inputClass} bg-emerald-50/30 font-bold text-emerald-700`}
          />
        </FormField>

        <FormField label="Qty">
          <input
            type="number"
            placeholder={fields.targetQty}
            value={fields.manualTargetQty}
            onChange={(e) => actions.setManualTargetQty(e.target.value)}
            className={`${inputClass} bg-sky-50/30 font-bold text-sky-700`}
          />
        </FormField>

        <button
          type="button"
          onClick={onExecuteOrder}
          className="h-10 w-full self-end rounded-lg bg-slate-900 px-4 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-black active:scale-95"
        >
          Execute
        </button>
      </div>
    </section>
  );
}