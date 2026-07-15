// client/src/lib/api.ts
import axios from "axios";

// Using the direct Railway API URL to fix the Vercel 404 proxy issues
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
