"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  options: {
    name: string;
    icon: string;
  }[];
  onChange: (v: string) => void;
};

export default function PlatformSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm text-slate-500">
        {label}
      </label>

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-full items-center justify-between rounded-2xl bg-white px-5 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span>
            {
              options.find(
                (p) => p.name === value
              )?.icon
            }
          </span>

          {value}
        </div>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 10,
            }}
            className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  onChange(option.name);
                  setOpen(false);
                }}
                className="flex h-14 w-full items-center gap-2 px-5 hover:bg-slate-100"
              >
                <span>{option.icon}</span>

                {option.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}