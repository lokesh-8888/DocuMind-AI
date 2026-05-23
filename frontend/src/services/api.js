import axios from "axios";

export const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
export const WS_BASE = API_BASE.replace(/^http/, "ws");

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(" ");
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") return detail.message || JSON.stringify(detail);
  if (error?.code === "ERR_NETWORK") return "Could not reach the backend. Check that it is running on http://127.0.0.1:8000.";
  return error?.message || fallback;
}
