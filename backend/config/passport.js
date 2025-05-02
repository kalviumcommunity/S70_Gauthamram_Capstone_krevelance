// ... (rest of app.js code above) ...

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // --- ADD THIS LINE ---
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      // --- END ADDITION ---
      session: false,
      // --- ADD THIS LINE (Matches what's used in authRoutes) ---
      passReqToCallback: true,
      // --- END ADDITION ---
    }, // Added 'req' parameter here as passReqToCallback is true
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          // Optional: Update Google profile info or add googleId if missing
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          businessSector: "Other",
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        console.error("Google Auth Error:", err);
        done(err, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email }).select("+password");

        if (!user) {
          return done(null, false, { message: "No user with that email." });
        }

        if (!user.password) {
          return done(null, false, {
            message:
              "This email is registered with Google. Please sign in with Google.",
          });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = {
  passport: passport,
  generateToken: generateToken,
};
