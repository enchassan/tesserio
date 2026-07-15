// server/src/routes/auth.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Dynamic environment routing
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// @desc    Initiate Google OAuth Handshake
// @route   GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// @desc    Google OAuth Callback Interceptor
// @route   GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login`, // DYNAMIC FIX
    session: false,
  }),
  (req, res) => {
    // Create secure JWT token payload containing the user's MongoDB unique identifier
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }, // Session lifetime lasts for 7 days
    );

    // Bake token into an enterprise-grade HttpOnly cookie wrapper
    res.cookie("token", token, {
      httpOnly: true, // Shields the cookie from malicious client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Requires SSL encryption over HTTPS in production environments
      sameSite: "lax", // Protects against cross-site request forgery attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token expiration metrics
    });

    // Safe landing redirection straight back to your Next.js client canvas dashboard
    res.redirect(`${CLIENT_URL}/`); // DYNAMIC FIX
  },
);

// @desc    Logout user and destroy session cookie
// @route   GET /api/auth/logout
// @access  Private
router.get("/logout", (req, res) => {
  // Clear the JWT or session cookie cleanly
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Platform session cleared cleanly.",
  });
});

module.exports = router;
