import FormField from "./FormField";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 px-3 text-base font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function SettingsModal({ fields, actions }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">
            Investment Settings
          </h2>
        </div>

        <div className="grid gap-4 px-5 py-5">
          <FormField label="S Investment">
            <input
              type="number"
              value={fields.sInvestment}
              onChange={(event) => actions.setSInvestment(event.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="N Investment">
            <input
              type="number"
              value={fields.nInvestment}
              onChange={(event) => actions.setNInvestment(event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => actions.setShowSettings(false)}
            className="h-10 rounded-lg border border-slate-300 text-sm font-black uppercase text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={actions.saveSettings}
            className="h-10 rounded-lg bg-emerald-600 text-sm font-black uppercase text-white transition hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
