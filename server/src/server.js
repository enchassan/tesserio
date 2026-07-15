// server/src/server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const pinRoutes = require("./routes/pins");
const authRoutes = require("./routes/auth");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

require("./config/passport");

const app = express();
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
        /https:\/\/.*\.vercel\.app$/i.test(origin);

      return callback(null, isAllowed);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Tesserio API is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
