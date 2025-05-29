const express = require("express");
const router = express.Router();
const { passport, generateToken } = require("../config/passport");
const User = require("../models/user");
const { ALLOWED_SECTORS } = require("../models/user");

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true, 
    token: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      businessSector: user.businessSector,
      tier: user.tier,
    },
  });
};

router.post("/signup", async (req, res, next) => {
  const { name, email, password, agreeTerms, businessSector } = req.body; 

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
  } 

  if (!/^\w+([.-]?\w+)*@\w+([.-]*\w+)*(\.\w{2,3})+$/.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address." });
  } 

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
      }); 
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
      password,
      businessSector, 
    });

    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) =>
      console.error("Error updating last login:", err)
    );

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Signup Error:", err); 
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email address is already registered." });
    }
    return res
      .status(500)
      .json({ message: "An error occurred during signup." });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Login Authentication Error:", err);
      return res
        .status(500)
        .json({ message: "Authentication error. Please try again later." });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info ? info.message : "Invalid credentials." });
    } 

    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) =>
      console.error("Error updating last login:", err)
    );

    console.log(`User ${user.email} logged in successfully via JWT.`);
    sendTokenResponse(user, 200, res);
  })(req, res, next);
});

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
    if (req.user) {
      console.log("Google callback successful."); 

      const token = generateToken(req.user._id);

      const redirectUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        : `/auth/callback?token=${token}`;

      res.redirect(redirectUrl);
    } else {

      console.error("Google callback failed unexpectedly.");
      res.redirect(
        process.env.FRONTEND_URL
          ? `${process.env.FRONTEND_URL}/login?error=google_auth_issue`
          : "/login?error=google_auth_issue"
      );
    }
  }
);



router.post("/logout", (req, res) => {
  res
    .status(200)
    .json({ message: "Logout signal received (client should discard token)" });
});

module.exports = router;
