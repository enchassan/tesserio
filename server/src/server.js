// server/src/server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");

dotenv.config();

const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.warn(
    `[server] WARNING: Missing environment variables: ${missingEnv.join(", ")}. ` +
      "Some features will be unavailable.",
  );
}

const connectDB = require("./config/db");
connectDB();

require("./config/passport");

const pinRoutes = require("./routes/pins");
const authRoutes = require("./routes/auth");

const app = express();

// Trust proxy is REQUIRED for secure cookies behind Railway
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/i.test(origin);

      if (!isAllowed) {
        console.warn(`[cors] Blocked origin: ${origin}`);
      }

      return callback(null, isAllowed);
    },
    credentials: true, // CRITICAL: Allows Vercel to send the cookie back to Railway
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Tesserio API is running",
    service: "backend",
  });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    ["disconnected", "connected", "connecting", "disconnecting"][dbState] ||
    "unknown";

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
  console.log(`[server] Health check: http://0.0.0.0:${PORT}/api/health`);
});
