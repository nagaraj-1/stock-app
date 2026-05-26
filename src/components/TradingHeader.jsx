import { Settings } from "lucide-react";

export default function TradingHeader({
  onOpenSettings,
  onExecuteOrder,
}) {
  return (
    <header className="flex h-1 shrink-0 items-center justify-between">
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open investment settings"
          title="Settings"
          className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
        >
          <Settings size={16} />
        </button>
      </div>

    </header>
  );
}