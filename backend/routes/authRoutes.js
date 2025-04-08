const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken");
const passport = require('passport'); 
const User = require("../models/user"); 

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Set it in your .env file.");
    process.exit(1); 
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:1613'; 


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" }); 
};


router.post("/signup", async (req, res) => {
  const { name, email, password,agreeTerms} = req.body;



   if (agreeTerms !== true) {
       return res.status(400).json({ errors: [{ msg: "You must agree to the Terms of Service and Privacy Policy" }] });
   }

 

  try {
    let user = await User.findOne({ email: email.toLowerCase() }); 
    if (user) {
      return res.status(400).json({ errors: [{ msg: "Email already registered" }] });
    }

    user = new User({
        name,
        email, 
        password,
        agreeTerms 
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Signup successful", 
      token: token,
      user: { 
          id: user._id, 
          name: user.name,
          email: user.email
      }
    });

  } catch (err) {
    console.error("Signup Error:", err.message);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ errors: messages.map(msg => ({ msg })) });
    }
    if (err.code === 11000) {
        return res.status(400).json({ errors: [{ msg: 'Email already registered.' }] });
    }
    res.status(500).json({ errors: [{ msg: "Server error during signup" }] });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
     return res.status(400).json({ errors: [{ msg: "Please provide email and password" }] });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] }); 
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const token = generateToken(user._id);
    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
     });

  } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ errors: [{ msg: "Server error during login" }] });
  }
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'], 
}));



router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=google-auth-failed`,
        session: false
     }),
    (req, res) => {
        if (!req.user) {
            console.error("Google callback reached but req.user is not defined.");
            return res.redirect(`${FRONTEND_URL}/login?error=google-auth-error`);
        }
        const token = generateToken(req.user._id);
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    }
);


module.exports = router; 