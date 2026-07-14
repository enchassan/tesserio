// client/src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Crucial for forwarding HttpOnly session cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});
