const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require('passport');
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Set it in your .env file.");
    process.exit(1);
}
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:1613'; 

router.post("/signup", async (req, res) => {
    const { name, email, password, agreeTerms } = req.body;

    if (!name || !email || !password) {
       return res.status(400).json({ errors: [{ msg: "Please provide name, email, and password" }] });
    }
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
            email: email.toLowerCase(),
            password,
            agreeTerms
        });

        await user.save();

        req.login(user, function(err) {
            if (err) {
                console.error("Login after signup Error:", err);
                return res.status(500).json({ errors: [{ msg: "Server error during post-signup login" }] });
            }
            return res.status(201).json({
                 message: "Signup successful and logged in",
                 user: {
                     id: user._id,
                     name: user.name,
                     email: user.email
                 }
             });
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

router.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => { 
        if (err) {
            console.error("Login Error:", err);
            return res.status(500).json({ errors: [{ msg: "Server error during login" }] });
        }
        if (!user) {
            return res.status(401).json({ errors: [{ msg: info.message || "Invalid credentials" }] });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error("Session Login Error:", loginErr);
                return res.status(500).json({ errors: [{ msg: "Server error establishing session" }] });
            }
            return res.json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    })(req, res, next);
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=google-auth-failed`, 
    }),
    (req, res) => {
        if (!req.user) {
            console.error("Google callback success but req.user is missing.");
            return res.redirect(`${FRONTEND_URL}/login?error=session-error`);
        }
        console.log('Google Auth Successful, user:', req.user.email, 'Session ID:', req.sessionID);
        res.redirect(`${FRONTEND_URL}/dashboard`);
    }
);

router.post('/logout', (req, res, next) => {
  req.logout(function(err) { 
    if (err) {
        console.error("Logout Error:", err);
        return res.status(500).json({ errors: [{ msg: "Server error during logout" }] });
     }
    res.status(200).json({ message: "Logout successful" });
  });
});


module.exports = router;