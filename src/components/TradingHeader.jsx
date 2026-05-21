import { Settings } from "lucide-react";

export default function TradingHeader({ onOpenSettings, onExecuteOrder }) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Stock Trading</h1>
        <p className="text-sm font-medium text-slate-500">Smart Order Entry</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open investment settings"
          title="Settings"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
        >
          <Settings size={19} />
        </button>

      </div>
    </header>
  );
}
