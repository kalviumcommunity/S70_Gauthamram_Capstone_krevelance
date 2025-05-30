const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../services/emailService"); 
const crypto = require("crypto");

const { createCustomer: createRazorpayCustomer, createSubscription: createRazorpaySubscription, cancelSubscription: cancelRazorpaySubscription, fetchSubscription: fetchRazorpaySubscription, getRazorpayPlanId, } = require("../services/razorpayService"); 


const getProfileSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      address: user.address, 
      countryCode: user.address ? user.address.countryCode : undefined,
      profileLockedFields: user.profileLockedFields,
      currentPlan: user.currentPlan,
      subscriptionStatus: user.subscriptionStatus,
      nextBillingDate: user.nextBillingDate,
    });
  } catch (error) {
    console.error("Error fetching profile settings:", error);
    res.status(500).json({ message: "Server error fetching profile." }); 
  }
};


// @route   PUT /api/settings/profile
const updateProfileSettings = async (req, res) => {
  const {
    name,
    company,
    phone,
    street,
    city,
    state,
    zip,
    country,
    countryCode,
  } = req.body;

  try {
    const user = await User.findById(req.user._id); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } 

    if (
      user.profileLockedFields &&
      user.profileLockedFields.name &&
      name !== undefined && 
      user.name && 
      user.name !== "" &&
      user.name !== name
    ) {
      return res.status(403).json({ message: "Name cannot be changed." });
    } 
    if (
      name !== undefined &&
      (!user.profileLockedFields ||
        !user.profileLockedFields.name ||
        !user.name) 
    ) {
      user.name = name;
    }

    if (company !== undefined) user.company = company;
    if (phone !== undefined) user.phone = phone;

    if (!user.address) {
      user.address = {};
    }
    if (street !== undefined) user.address.street = street;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (zip !== undefined) user.address.zip = zip;
    if (country !== undefined) user.address.country = country;
    if (countryCode !== undefined) user.address.countryCode = countryCode; 
    const updatedUser = await user.save(); 

    res.json({
      message: "Profile updated successfully!",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileLockedFields: updatedUser.profileLockedFields, 
        currentPlan: updatedUser.currentPlan, 
        subscriptionStatus: updatedUser.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Error updating profile settings:", error); 
    res.status(500).json({
      message: "Server error updating profile.",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ message: "Please provide all password fields." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters long." });
  }

  try {
    const user = await User.findById(req.user._id).select("+password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Password cannot be updated for this account type." });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    user.password = newPassword;
    await user.save(); 

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error while updating password." });
  }
};


const getBillingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "currentPlan subscriptionStatus nextBillingDate razorpaySubscriptionId"
    );
    if (!user) return res.status(404).json({ message: "User not found" }); 
    if (user.razorpaySubscriptionId) {
      try {
        const razorpaySubDetails = await fetchRazorpaySubscription(
          user.razorpaySubscriptionId
        );
        user.nextBillingDate = new Date(razorpaySubDetails.current_end * 1000); 
        user.subscriptionStatus = razorpaySubDetails.status;
        await user.save(); 
      } catch (razorpayError) {
        console.warn(
          `Could not fetch Razorpay subscription details for user ${user._id}:`,
          razorpayError.message
        );
      }
    }

    res.json({
      currentPlan: user.currentPlan,
      subscriptionStatus: user.subscriptionStatus,
      nextBillingDate: user.nextBillingDate,
      razorpaySubscriptionId: user.razorpaySubscriptionId,
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    res
      .status(500)
      .json({ message: "Server error fetching billing information." });
  }
};

// @desc    Handle user subscription change (upgrade/downgrade/cancel)
// @route   POST /api/settings/billing/subscribe

const handleSubscriptionChange = async (req, res) => {
  const { newPlanId } = req.body; 

  try {
    const user = await User.findById(req.user._id); 
    if (!user) return res.status(404).json({ message: "User not found" }); 

    if (newPlanId === "free") {
      if (user.razorpaySubscriptionId) {
        try {
        
          await cancelRazorpaySubscription(user.razorpaySubscriptionId, true);
          user.subscriptionStatus = "pending_cancellation";
          console.log(
            `User ${user._id} downgraded to Free. Old subscription ${user.razorpaySubscriptionId} marked for cancellation at cycle end.`
          );
        } catch (error) {
          console.error(
            `Error cancelling existing subscription ${user.razorpaySubscriptionId} for user ${user._id} during downgrade:`,
            error
          );
          return res.status(500).json({
            message: "Failed to process downgrade. Please try again.",
          });
        }
      }
      user.currentPlan = "free";
      user.razorpaySubscriptionId = null;
      user.nextBillingDate = null;

      await user.save();
      return res.json({
        message: `Successfully changed to ${newPlanId} plan.`,
        currentPlan: user.currentPlan,
      });
    }

    const targetRazorpayPlanId = getRazorpayPlanId(newPlanId);

    if (!targetRazorpayPlanId) {
      return res.status(400).json({
        message:
          "Invalid target plan ID or plan not supported for Razorpay subscription.",
      });
    }

    if (!user.razorpayCustomerId) {
      console.log(`Creating new Razorpay customer for user ${user._id}`);
      const razorpayCustomer = await createRazorpayCustomer(
        user.name,
        user.email,
        user.phone
      );
      user.razorpayCustomerId = razorpayCustomer.id;
      await user.save();
    }
    if (user.razorpaySubscriptionId) {
      try {
        await cancelRazorpaySubscription(user.razorpaySubscriptionId, false);
        console.log(
          `Cancelled old subscription ${user.razorpaySubscriptionId} for user ${user._id} before creating new one.`
        );
      } catch (error) {
        console.error(
          `Error cancelling existing subscription ${user.razorpaySubscriptionId} for user ${user._id} before upgrade:`,
          error
        );
      }
    }

    console.log(
      `Creating new Razorpay subscription for user ${user._id} with plan ${targetRazorpayPlanId}`
    );
    const newSubscription = await createRazorpaySubscription(
      targetRazorpayPlanId,
      user.razorpayCustomerId
    );

    user.razorpaySubscriptionId = newSubscription.id;
    user.currentPlan = newPlanId;
    user.subscriptionStatus = newSubscription.status;
    await user.save();
    res.json({
      message: `Subscription change to ${newPlanId} initiated.`,
      subscriptionId: newSubscription.id,
      status: newSubscription.status,
       checkoutUrl: newSubscription.short_url || newSubscription.checkout_url || null
    });
  } catch (error) {
    console.error(
      `Error changing subscription for user ${req.user._id}:`,
      error
    );
    res.status(500).json({
      message: "Server error during subscription change.",
      error: error.message,
    });
  }
};

const requestAccountDeletion = async (req, res) => {
  let user;
  try {
    user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.deleteAccountToken = token;
    user.deleteAccountExpires = Date.now() + 3600000;

    await user.save();
    const deleteUrl = `${process.env.FRONTEND_URL || "http://localhost:1613"}/confirm-delete-account?token=${token}`; 

    
    const websiteName = "Krevelance"; 
    const emailSubject = `Confirm Your Account Deletion - ${websiteName}`;
    const userName = user.name;
    const mainMessage = `You recently requested to delete your ${websiteName} account. Confirm to permanently delete your account, please click the button below.`;
    const linkText = "Confirm Account Deletion";
    const expiryInfo = "This confirmation link is valid for 1 hour.";
    const footerText = `If you did not request this action, please ignore this email. Your account will remain safe.`;

 
    await sendEmail({
      email: user.email,
      subject: emailSubject,
      websiteName: websiteName,
      userName: userName,
      mainMessage: mainMessage,
      actionLink: deleteUrl,
      linkText: linkText,
      expiryInfo: expiryInfo,
      footerText: footerText,
    });

    res.json({
      message:
        "An email has been sent to your address with a link to confirm account deletion. Please check your inbox (and spam folder).",
    });
  } catch (error) {
    console.error(
      `Error requesting account deletion for user ${req.user?._id || 'ID not available'}:`, 
      error
    );

    
    if (user && user.deleteAccountToken) {
      user.deleteAccountToken = undefined;
      user.deleteAccountExpires = undefined;
      try {
        await user.save();
        console.log(`Cleaned up deletion token for user ${user._id} after error.`);
      } catch (saveErr) {
        console.error("Error cleaning up user token after failed deletion request:", saveErr);
      }
    }

    res
      .status(500)
      .json({ message: "Server error while requesting account deletion. Please try again later." });
  }
};


const confirmAccountDeletion = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Deletion token is required." });
  }

  try {
    const user = await User.findOne({
      deleteAccountToken: token,
      deleteAccountExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired deletion token." });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error confirming account deletion:", error);
    res.status(500).json({ message: "Server error while deleting account." });
  }
};

const dashboardprofile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching user name for dashboard header:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: Problem with fetching user name." });
  }
};




const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  console.log("Razorpay Webhook Received:", req.body);

  try {
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.warn("Webhook signature mismatch!");
      return res.status(400).json({ status: "Signature mismatch" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    let user;

    if (payload.subscription && payload.subscription.entity) {
      const subscriptionDetails = payload.subscription.entity;
      const razorpaySubscriptionId = subscriptionDetails.id;

      user = await User.findOne({ razorpaySubscriptionId: razorpaySubscriptionId });

      if (!user) {
        console.warn(`Webhook: User not found for subscription ID: ${razorpaySubscriptionId}`);

        if (subscriptionDetails.customer_id) {
            user = await User.findOne({ razorpayCustomerId: subscriptionDetails.customer_id });
            if (!user) {
                console.warn(`Webhook: User not found for customer ID: ${subscriptionDetails.customer_id} either.`);
                return res.status(200).send("User not found, but webhook acknowledged.");
            }
            
            if (!user.razorpaySubscriptionId && event === 'subscription.activated') {
                user.razorpaySubscriptionId = razorpaySubscriptionId;
            }
        } else {
             return res.status(200).send("User not found, webhook acknowledged.");
        }
      }
    } else if (payload.payment && payload.payment.entity && payload.payment.entity.customer_id) {
        
        const customerId = payload.payment.entity.customer_id;
        user = await User.findOne({ razorpayCustomerId: customerId });
        if (!user) {
            console.warn(`Webhook (Payment Event): User not found for customer ID: ${customerId}`);
            return res.status(200).send("User not found, webhook acknowledged.");
        }
    }


    if (!user && event !== 'customer.created') {
         console.warn(`Webhook: User context could not be established for event ${event}.`);
         return res.status(200).send("User context not established, webhook acknowledged.");
    }


    switch (event) {
      case "subscription.activated":
        user.subscriptionStatus = "active";
        user.nextBillingDate = new Date(payload.subscription.entity.current_end * 1000);
        console.log(`Subscription activated for user ${user.email}`);
        break;

      case "subscription.charged":
        user.subscriptionStatus = "active"; 
        user.nextBillingDate = new Date(payload.subscription.entity.current_end * 1000);
        console.log(`Subscription charged for user ${user.email}. Next billing: ${user.nextBillingDate}`);
        break;

      case "subscription.halted": 
        user.subscriptionStatus = "past_due";
        console.log(`Subscription halted for user ${user.email}`);
        break;

      case "subscription.cancelled":
        user.subscriptionStatus = "cancelled";
        user.currentPlan = "free";
        user.razorpaySubscriptionId = null; 
        user.nextBillingDate = null;
        console.log(`Subscription cancelled for user ${user.email}. Plan set to free.`);
        break;

      case "payment.failed":
        console.error(`Payment failed for user ${user ? user.email : 'unknown (check customer ID)'}. Payment ID: ${payload.payment.entity.id}`);
        if (user && user.subscriptionStatus !== 'halted' && user.subscriptionStatus !== 'past_due') {
        }
        break;

      default:
        console.log(`Unhandled Razorpay webhook event: ${event}`);
    }

    if (user) { 
        await user.save();
    }

    res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};


module.exports = {
 getProfileSettings,
  updateProfileSettings,
  updatePassword,
  getBillingInfo, 
  handleSubscriptionChange,
  requestAccountDeletion,
  confirmAccountDeletion,
  dashboardprofile,
 handleRazorpayWebhook 
};
