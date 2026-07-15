// client/src/lib/api.ts
import axios from "axios";

// Point directly to the Railway backend domain in production to bypass Vercel's proxy rewrite layer.
// This allows cookies with sameSite: "none" and secure: true to be sent directly to the backend.
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://tesserio.up.railway.app/api"
    : "http://localhost:5000/api");

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
