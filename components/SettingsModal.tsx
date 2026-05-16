"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  CheckCircle2,
  X,
} from "lucide-react";

import {
  users,
  platforms,
} from "@/data/constants";

export default function SettingsModal({
  open,
  onClose,
  investmentSettings,
  setInvestmentSettings,
}: any) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <motion.div
          initial={{
            scale: 0.9,
          }}
          animate={{
            scale: 1,
          }}
          className="w-full max-w-3xl rounded-[32px] bg-white p-8 shadow-2xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black">
              Settings
            </h2>

            <button onClick={onClose}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {users.map((user) =>
              platforms.map((platform) => {
                const key = `${user}-${platform.name}`;

                return (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <div>{user}</div>

                    <div>
                      {platform.icon}{" "}
                      {platform.name}
                    </div>

                    <input
                      type="number"
                      value={
                        investmentSettings[
                          key
                        ]
                      }
                      onChange={(e) =>
                        setInvestmentSettings({
                          ...investmentSettings,
                          [key]: Number(
                            e.target.value
                          ),
                        })
                      }
                      className="h-12 rounded-xl border border-slate-200 px-4"
                    />
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <CheckCircle2 className="h-5 w-5" />
            Save Settings
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}