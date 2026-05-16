"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, Wallet, User as UserIcon } from "lucide-react";
import { users, platforms } from "@/data/constants";

export default function SettingsModal({
  open,
  onClose,
  investmentSettings,
  onSave,
}: any) {
  const [draftSettings, setDraftSettings] = useState<Record<string, number>>(investmentSettings);

  useEffect(() => {
    if (open) {
      setDraftSettings(investmentSettings);
    }
  }, [open, investmentSettings]);

  const handleSave = () => {
    onSave(draftSettings);
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative h-full max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Wallet className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">
                    Investment Allocation
                  </h2>
                  <p className="hidden sm:block text-slate-500 font-medium text-sm">Set budgets per user and platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4">
              <div className="grid gap-8 md:gap-10">
                {users.map((user: string) => (
                  <section key={user} className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <h3 className="text-lg font-bold text-slate-800">{user}'s Portfolio</h3>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {platforms.map((platform: any) => {
                        const key = `${user}-${platform.name}`;
                        return (
                          <div
                            key={key}
                            className="group relative overflow-hidden rounded-[28px] border-2 border-slate-100 bg-white p-5 transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{platform.icon}</span>
                                <span className="font-bold text-slate-700">{platform.name}</span>
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                Budget
                              </div>
                            </div>
                            
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={draftSettings[key] ?? 0}
                                onChange={(e) =>
                                  setDraftSettings({
                                    ...draftSettings,
                                    [key]: Number(e.target.value),
                                  })
                                }
                                onFocus={(e) => e.target.select()}
                                className="h-14 w-full rounded-2xl bg-slate-50 pl-9 pr-4 text-xl font-black text-slate-900 outline-none ring-offset-white transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <button
                  onClick={onClose}
                  className="h-14 md:h-16 px-8 rounded-2xl font-bold text-slate-500 transition-colors hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex h-14 md:h-16 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 text-lg font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}