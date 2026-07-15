// server/src/routes/auth.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

const CLIENT_URL =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      status: "fail",
      message: "Google OAuth is not configured on the server.",
    });
  }

  return passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({
        status: "fail",
        message: "Google OAuth is not configured on the server.",
      });
    }

    return passport.authenticate("google", {
      failureRedirect: `${CLIENT_URL}/login`,
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${CLIENT_URL}/`);
  },
);

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

router.get("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Platform session cleared cleanly.",
  });
});

module.exports = router;
