// server/src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const pinRoutes = require("./routes/pins");
const authRoutes = require("./routes/auth"); // Declared once at the top

// Load Environment Variables First
dotenv.config();

// Connect to Database
const connectDB = require("./config/db");
connectDB();

// Initialize Passport Strategies
require("./config/passport");

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Mount Handshake Routers
app.use("/api/auth", authRoutes); // Bound to /api/auth
app.use("/api/pins", pinRoutes);

// Base Health Route
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Tesserio API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
