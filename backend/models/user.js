const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ALLOWED_SECTORS = ['Agriculture', 'Tech/SaaS', 'Retail', 'Manufacturing', 'Other'];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true, 
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      lowercase: true, 
      trim: true,
    },
    password: {
      type: String,
      required: function() { return !this.googleId; }, 
      select: false,
    },
    businessSector: { 
        type: String,
        required: [true, "Please select your business sector"],
        enum: {
            values: ALLOWED_SECTORS,
            message: 'Invalid business sector selected. Please choose from the provided list.'
        }
    },
    lastLogin: { type: Date },
    tier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
   if (!this.password) return false; 
   return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
module.exports.ALLOWED_SECTORS = ALLOWED_SECTORS; 