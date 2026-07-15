// server/src/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// CRITICAL: Never use a relative path here.
// Relative paths get reconstructed by passport using req.protocol + req.hostname.
// Behind Railway's reverse proxy, even with trust proxy enabled, this can
// produce http:// URLs that Google's OAuth2 server rejects with "Bad Request".
// Always resolve to an absolute HTTPS URL in production.
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://tesserio.up.railway.app/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback");

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        // proxy: true tells passport to trust X-Forwarded-Proto headers
        // from Railway's load balancer so req.protocol resolves as "https"
        proxy: true,
        // Pass the scope here on the strategy as well, belt-and-suspenders
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value || "",
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  // serializeUser / deserializeUser are only needed for session-based auth.
  // This app uses session: false (JWT cookies), so these are no-ops.
  // Keep them registered so passport doesn't throw if session middleware
  // is ever attached, but they will never be called in normal flow.
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
} else {
  console.warn(
    "[passport] Google OAuth credentials are not configured. " +
      "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable authentication.",
  );
}
