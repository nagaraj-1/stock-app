import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function Header({
  onSettings,
}: {
  onSettings: () => void;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-5xl font-black">
          Trading Execution
        </h1>

        <p className="mt-2 text-slate-500">
          Premium Broker Terminal
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSettings}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl"
      >
        <Settings className="h-6 w-6" />
      </motion.button>
    </div>
  );
}