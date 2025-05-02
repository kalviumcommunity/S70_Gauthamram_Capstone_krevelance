const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user"); // Need User model to potentially fetch user details

const protect = asyncHandler(async (req, res, next) => {
  let token; // Check for token in the Authorization header (Bearer schema) // Frontend must send the token like: Authorization: 'Bearer TOKEN_STRING'

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]; // Verify token

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Attach user from token payload (excluding password) // The payload only has the user ID ('id'), so fetch the user from DB

      req.user = await User.findById(decoded.id).select("-password"); // Exclude password
      if (!req.user) {
        // User might have been deleted
        res.status(401);
        throw new Error("User not found");
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };

