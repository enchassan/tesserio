// client/src/lib/api.ts
import axios from "axios";

// All API calls use relative /api paths; Next.js rewrites proxy to Railway.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
