// client/src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Crucial for forwarding HttpOnly session cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});
