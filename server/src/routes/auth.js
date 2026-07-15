// server/src/routes/auth.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

const CLIENT_URL =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Fail loudly at boot time — a missing JWT secret is a critical
  // misconfiguration that will cause every auth operation to throw.
  console.error(
    "[auth] FATAL: JWT_SECRET environment variable is not set. " +
      "All token operations will fail. Set this value immediately.",
  );
}

// @desc  Initiate Google OAuth flow
// @route GET /api/auth/google
// @access Public
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      status: "fail",
      message: "Google OAuth is not configured on the server.",
    });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    // prompt: 'select_account' forces the account picker even when the
    // user has an active Google session — prevents stale-account issues
    prompt: "select_account",
  })(req, res, next);
});

// @desc  Google OAuth callback
// @route GET /api/auth/google/callback
// @access Public (Google redirects here)
router.get(
  "/google/callback",
  // Step 1: Let passport exchange the code for a token and fetch the profile.
  // On failure, redirect to the login page. session: false because we use JWT.
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({
        status: "fail",
        message: "Google OAuth is not configured on the server.",
      });
    }

    return passport.authenticate("google", {
      failureRedirect: `${CLIENT_URL}/login?error=oauth_failed`,
      session: false,
    })(req, res, next);
  },
  // Step 2: Passport succeeded — req.user is populated. Sign JWT and set cookie.
  (req, res) => {
    if (!req.user) {
      // Guard against a degenerate case where passport calls next() without
      // populating req.user (e.g. if the strategy calls done(null, false)).
      return res.redirect(`${CLIENT_URL}/login?error=no_user`);
    }

    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Cross-domain cookie requirements (Railway backend → Vercel frontend):
    // - secure: true         → HTTPS only (required for sameSite: 'none')
    // - sameSite: 'none'     → Allows cross-site requests (Vercel → Railway)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.redirect(`${CLIENT_URL}/`);
  },
);

// @desc  Get the currently authenticated user's profile
// @route GET /api/auth/me
// @access Private
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

// @desc  Log out the current user (clear the JWT cookie)
// @route GET /api/auth/logout
// @access Private
router.get("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Options MUST mirror the options used when the cookie was SET.
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Session cleared successfully.",
  });
});

module.exports = router;
