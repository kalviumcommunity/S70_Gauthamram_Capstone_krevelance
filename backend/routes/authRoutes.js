const express = require("express");
const router = express.Router();
// Use the modified passport export
const { passport, generateToken } = require("../config/passport");
const User = require("../models/user");
const { ALLOWED_SECTORS } = require("../models/user");
// const jwt = require('jsonwebtoken'); // Imported from config/passport

// --- ADD THIS HELPER FUNCTION DEFINITION ---
// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  // Send the token and user info in the response body
  res.status(statusCode).json({
    success: true, // Optional: Add success flag
    token: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      businessSector: user.businessSector,
      tier: user.tier,
      // Add any other necessary user fields here
    },
  });
};
// --- END ADDITION ---

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res, next) => {
  const { name, email, password, agreeTerms, businessSector } = req.body; // --- START: Add your validation logic here --- // Corrected validation check for agreeTerms

  if (
    !name ||
    !email ||
    !password ||
    agreeTerms === undefined ||
    !businessSector
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }
  // Added explicit check if agreeTerms is false
  if (!agreeTerms) {
    return res
      .status(400)
      .json({
        message: "You must agree to the Terms of Service and Privacy Policy.",
      });
  }

  if (!ALLOWED_SECTORS.includes(businessSector)) {
    return res.status(400).json({
      message: `Invalid business sector. Allowed: ${ALLOWED_SECTORS.join(
        ", "
      )}`,
    });
  } // Basic email format check (more robust check is in User model/frontend)

  if (!/^\w+([.-]?\w+)*@\w+([.-]*\w+)*(\.\w{2,3})+$/.test(email)) {
    // Corrected regex slightly
    return res
      .status(400)
      .json({ message: "Please provide a valid email address." });
  } // Password strength validation (mirroring frontend or backend rules)

  if (
    password.length < 8 ||
    password.length > 20 ||
    !/(?=.*[A-Z])/.test(password) ||
    !/(?=.*\d)/.test(password) ||
    !/(?=.*[!@#$%^&*])/.test(password)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Password does not meet requirements (8-20 chars, 1 uppercase, 1 number, 1 special character).",
      }); // Added detail to error message
  }

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with that email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
      businessSector, // agreeTerms is not in your User model schema, if you need to store it, add it to the schema // agreeTerms: agreeTerms,
    }); // Instead of req.login(), generate a JWT

    // Optional: Update last login time (fire and forget)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) =>
      console.error("Error updating last login:", err)
    ); // Use the helper function to send the token and user info

    sendTokenResponse(user, 201, res); // 201 Created status for signup
  } catch (err) {
    console.error("Signup Error:", err); // Handle specific Mongoose errors if needed (e.g., duplicate key)
    if (err.code === 11000) {
      // Duplicate key error
      return res
        .status(400)
        .json({ message: "Email address is already registered." });
    }
    return res
      .status(500)
      .json({ message: "An error occurred during signup." });
  }
});

// --- LOGIN ROUTE (JWT Based) ---
router.post("/login", (req, res, next) => {
  // Use passport.authenticate with session: false and a custom callback
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Login Authentication Error:", err);
      return res
        .status(500)
        .json({ message: "Authentication error. Please try again later." });
    }
    if (!user) {
      // info contains the message from the LocalStrategy (e.g., 'Incorrect password.')
      return res
        .status(401)
        .json({ message: info ? info.message : "Invalid credentials." });
    } // If user is authenticated by Passport, use the helper function to send the response // Optional: Update last login time (fire and forget) - moved this inside the helper previously, but can be here too

    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) =>
      console.error("Error updating last login:", err)
    );

    console.log(`User ${user.email} logged in successfully via JWT.`);
    sendTokenResponse(user, 200, res); // 200 OK status for login
  })(req, res, next); // Invoke the authenticate middleware
});

// --- GOOGLE AUTH ROUTES (Modify Callback to Return Token) ---
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/login?error=google_failed`
      : "/login?error=google_failed",
    session: false,
  }),
  (req, res) => {
    // If authentication was successful (user object is attached to req.user by Passport)
    if (req.user) {
      console.log("Google callback successful."); // Generate JWT for the user and redirect // NOTE: Passing token in URL is less secure but matches your frontend AuthCallback logic.

      const token = generateToken(req.user._id);

      const redirectUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        : `/auth/callback?token=${token}`;

      res.redirect(redirectUrl);
    } else {
      // This block should ideally not be reached if failureRedirect is set,
      // but as a fallback:
      console.error("Google callback failed unexpectedly.");
      res.redirect(
        process.env.FRONTEND_URL
          ? `${process.env.FRONTEND_URL}/login?error=google_auth_issue`
          : "/login?error=google_auth_issue"
      );
    }
  }
);

// --- Logout Route (Optional) ---
router.post("/logout", (req, res) => {
  // With JWT, backend doesn't 'log out' the user in the traditional sense.
  // The client simply discards the token.
  // Send a success response indicating client-side logout is needed.
  res
    .status(200)
    .json({ message: "Logout signal received (client should discard token)" });
});

module.exports = router;
