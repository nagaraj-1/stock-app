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
  ? normalizedApiBase.replace(/\/?$/, "").endsWith("/api")
    ? normalizedApiBase
    : `${normalizedApiBase.replace(/\/+$|\/$/, "")}/api`
  : "/api";

export const INVESTMENT_SETTINGS_URL =
  `${API_PREFIX}/investment-settings`;

const normalizedWsBase = normalizedApiBase
  ? normalizedApiBase.replace(/^http/, "ws")
  : "";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  (normalizedWsBase ? `${normalizedWsBase}/ws` : "/ws");