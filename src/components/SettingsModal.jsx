import FormField from "./FormField";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 px-3 text-base font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function SettingsModal({ fields, actions }) {
  const stopNagTrack = async () => {
    try {
      const response = await fetch(
        "https://stock.eatoo.in/api/stop-all-tracks",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to stop tracking");
      }

      const text = await response.text();
      alert(text || "NAG tracking stopped successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to stop NAG tracking");
    }
  };

  const stopCutieTrack = async () => {
   
    try {
      const response = await fetch(
        "https://stock1.eatoo.in/api/stop-all-tracks",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to stop tracking");
      }

      const text = await response.text();
      alert(text || "CUTIE tracking stopped successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to stop CUTIE tracking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-violet-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-2xl shadow-violet-950/25">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-100 via-fuchsia-50 to-orange-50 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">
            Investment Settings
          </h2>
        </div>

        <div className="grid gap-4 px-5 py-5">
          <FormField label="CUTIE Investment">
            <input
              type="number"
              value={fields.cInvestment}
              onChange={(event) => actions.setCInvestment(event.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="NAG Investment">
            <input
              type="number"
              value={fields.nInvestment}
              onChange={(event) => actions.setNInvestment(event.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Target Percentage">
            <input
              type="number"
              min="0"
              step="0.01"
              value={fields.targetPercent}
              onChange={(event) =>
                actions.setTargetPercent(event.target.value)
              }
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={stopNagTrack}
              className="h-10 rounded-lg bg-red-600 text-sm font-black uppercase text-white transition hover:bg-red-700"
            >
              Stop NAG Track
            </button>

            <button
              type="button"
              onClick={stopCutieTrack}
              className="h-10 rounded-lg bg-orange-600 text-sm font-black uppercase text-white transition hover:bg-orange-700"
            >
              Stop CUTIE Track
            </button>
          </div>
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
            className="h-10 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-sm font-black uppercase text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
