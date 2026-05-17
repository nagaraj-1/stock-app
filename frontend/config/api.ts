const rawApiHost =
  process.env.NEXT_PUBLIC_API_HOST
    ?.trim()
    .replace(/\/+$/g, "") || "stock.eatoo.in/api";

const apiHost = rawApiHost;

const normalizedApiBase = apiHost
  ? apiHost.startsWith("http://") || apiHost.startsWith("https://")
    ? apiHost
    : apiHost.startsWith("localhost") || apiHost.startsWith("127.")
    ? `http://${apiHost}`
    : `https://${apiHost}`
  : "";

export const API_PREFIX = normalizedApiBase
  ? `${normalizedApiBase}`
  : "/api";

export const INVESTMENT_SETTINGS_URL =
  `${API_PREFIX}/investment-settings`;

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  "ws://https://stock.eatoo.in/ws";