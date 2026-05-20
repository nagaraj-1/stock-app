import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function SettingsModal({ open, onClose }) {

  const [nagInvestment, setNagInvestment] = useState("");
  const [cutieInvestment, setCutieInvestment] = useState("");
  const [kiteUrl, setKiteUrl] = useState("");
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    setNagInvestment(localStorage.getItem("nag_investment") || "");
    setCutieInvestment(localStorage.getItem("cutie_investment") || "");
    setKiteUrl(localStorage.getItem("kite_url") || "");
    setBackendUrl(localStorage.getItem("backend_url") || "");
  }, [open]);

  const saveSettings = () => {

    localStorage.setItem("nag_investment", nagInvestment);

    localStorage.setItem("cutie_investment", cutieInvestment);

    localStorage.setItem("kite_url", kiteUrl);

    localStorage.setItem("backend_url", backendUrl);

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">

      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-white text-xl font-bold">
            Settings
          </h2>

          <button onClick={onClose}>
            <X className="text-white" />
          </button>

        </div>

        <div className="space-y-4">

          <input
            placeholder="NAG Investment Amount"
            value={nagInvestment}
            onChange={(e) => setNagInvestment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Cutie Investment Amount"
            value={cutieInvestment}
            onChange={(e) => setCutieInvestment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Kite API URL"
            value={kiteUrl}
            onChange={(e) => setKiteUrl(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Backend API URL"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <button
            onClick={saveSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 text-white font-bold"
          >
            SAVE SETTINGS
          </button>

        </div>

      </div>

    </div>
  );
}