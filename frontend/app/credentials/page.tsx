"use client";

import { useState } from "react";
import { API_PREFIX } from "@/config/api";
import Link from "next/link";

const INITIAL_USERS = {
  CUTIE: {
    api_key: "",
    secret: "",
  },
  NAG: {
    api_key: "",
    secret: "",
  },
};

export default function CredentialsPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (user: string, field: "api_key" | "secret", value: string) => {
    setUsers((prev) => ({
      ...prev,
      [user]: {
        ...prev[user as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const saveCredentials = async () => {
    setLoading(true);
    setStatus("");

    try {
      const results: string[] = [];

      for (const user of Object.keys(users)) {
        const { api_key, secret } = users[user as keyof typeof users];

        if (!api_key || !secret) {
          results.push(`${user}: missing api key or secret`);
          continue;
        }

        const url = `${API_PREFIX}/save-credentials?user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(
          api_key
        )}&secret=${encodeURIComponent(secret)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.status === "error") {
          results.push(`${user}: ${data.detail || data.message || response.statusText}`);
        } else {
          results.push(`${user}: saved successfully`);
        }
      }

      setStatus(results.join(" | "));
    } catch (error) {
      setStatus(`Save failed: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Groww API Credentials</h1>
            <p className="mt-2 text-slate-500">Enter API key and secret for both users so order execution can use the right account.</p>
          </div>
          <Link href="/" className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-700">
            Back to Dashboard
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(users).map(([user, creds]) => (
            <section key={user} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">{user}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">User</span>
              </div>

              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-slate-400">API Key</label>
              <input
                type="text"
                value={creds.api_key}
                onChange={(event) => handleChange(user, "api_key", event.target.value)}
                placeholder="Enter API key"
                className="mb-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />

              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-slate-400">API Secret</label>
              <input
                type="password"
                value={creds.secret}
                onChange={(event) => handleChange(user, "secret", event.target.value)}
                placeholder="Enter API secret"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </section>
          ))}
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <button
            onClick={saveCredentials}
            disabled={loading}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-900 px-8 text-base font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Credentials"}
          </button>

          {status && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
