// client/src/lib/api.ts
import axios from "axios";

// Use Vercel's rewrite proxy (/api/* → Railway) so all requests are same-origin.
// This ensures cookies set by the backend are stored on the Vercel domain
// and sent back automatically — no cross-domain cookie issues.
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:5000/api");

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
