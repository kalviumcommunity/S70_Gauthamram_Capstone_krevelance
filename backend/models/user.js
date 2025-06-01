const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ALLOWED_SECTORS = ['Agriculture', 'Tech/SaaS', 'Retail', 'Manufacturing', 'Other'];

const UserSchema = new mongoose.Schema(
  {
    deleteAccountToken: { type: String },
    deleteAccountExpires: { type: Date },

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
      canChange: { type: Boolean, default: false } 
    },
    password: {
      type: String,
     required: function() {
      return !this.googleId;
    },
    minlength: 8,
    select: false,
    },
    googleId: {
    type: String,
    unique: true,
    sparse: true 
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
     company: {
        type: String,
        trim: true,
        default: '',
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    address: {
        street: { type: String, trim: true, default: '' },
        city: { type: String, trim: true, default: '' },
        state: { type: String, trim: true, default: '' },
        zip: { type: String, trim: true, default: '' },
        country: { type: String, trim: true, default: '' }, 
       
    },


    //BILLING
    currentPlan: {
        type: String,
        enum: ['free', 'pro', 'enterprise', null], 
        default: 'free', 
    },
    razorpayCustomerId: { 
        type: String,
        trim: true,
    },
    razorpaySubscriptionId: { 
        type: String,
        trim: true,
    },
    subscriptionStatus: {
        type: String,
        enum: ['created', 'active', 'inactive', 'cancelled', 'past_due', null],
        default: null,
    },
    nextBillingDate: {
        type: Date,
    },
    profileLockedFields: {
        name: { type: Boolean, default: false }, 
        email: { type: Boolean, default: true }, 
      },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
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