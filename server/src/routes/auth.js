// server/src/routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// @desc    Initiate Google OAuth Handshake
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google OAuth Callback Interceptor
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', session: false }),
    (req, res) => {
        // Create secure JWT token payload containing the user's MongoDB unique identifier
        const token = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Session lifetime lasts for 7 days
        );

        // Bake token into an enterprise-grade HttpOnly cookie wrapper
        res.cookie('token', token, {
            httpOnly: true, // Shields the cookie from malicious client-side JavaScript access
            secure: process.env.NODE_ENV === 'production', // Requires SSL encryption over HTTPS in production environments
            sameSite: 'lax', // Protects against cross-site request forgery attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token expiration metrics
        });

        // Safe landing redirection straight back to your Next.js client canvas dashboard
        res.redirect('http://localhost:3000/');
    }
);

// @desc    Secure Log Out / Purge Authentication Cookie
// @route   POST /api/auth/logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Session successfully terminated' });
});

module.exports = router;