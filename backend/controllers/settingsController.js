const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../services/emailService"); 
const crypto = require("crypto");

const { createCustomer: createRazorpayCustomer, createSubscription: createRazorpaySubscription, 
  cancelSubscription: cancelRazorpaySubscription, fetchSubscription: fetchRazorpaySubscription,
  deletePaymentMethodFromRazorpay, getRazorpayPlanId,fetchRazorpayCustomerByEmail, razorpayInstance } = require("../services/razorpayService"); 

  const planIdMap = {
    'free': null, 
    'pro': process.env.RAZORPAY_PRO_PLAN_ID,
    'enterprise': process.env.RAZORPAY_ENTERPRISE_PLAN_ID,
};


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
  const { name, company, phone, street, city, state, zip, country, countryCode } = req.body;

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
      message: "Server error in updating profile.",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ message: "Please provide all password fields" });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords don't match." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters." });
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
    const deleteUrl = `https://krevelance.netlify.app/confirm-delete-account?token=${token}`; 

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
        console.log(`Cleaned up delete token for user ${user._id} after error.`);
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


// @desc    Handle user subscription change (upgrade/downgrade/cancel)
// @route   POST /api/settings/billing/subscribe

const handleSubscriptionChange = async (req, res) => {
    const userId = req.user.id;
    const { newPlanId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const oldRazorpaySubscriptionId = user.razorpaySubscriptionId;

        if (newPlanId === 'free') {
            if (oldRazorpaySubscriptionId) {
                try {
                    const existingSubscription = await fetchRazorpaySubscription(oldRazorpaySubscriptionId);
                    const status = existingSubscription.status;

                    if (status === 'active' || status === 'halted') {
                        await cancelRazorpaySubscription(oldRazorpaySubscriptionId, true); 
                        user.subscriptionStatus = 'cancelled';
                        console.log(`Active/Halted Razorpay subscription ${oldRazorpaySubscriptionId} for user ${userId} scheduled for cancellation.`);
                    } else if (status === 'created' || status === 'pending') {
                       
                        console.log(`User ${userId} downgrading to free from a '${status}' Razorpay subscription ${oldRazorpaySubscriptionId}. Clearing local subscription details.`);
                        user.subscriptionStatus = 'cancelled'; 
                    } else {
                        console.log(`Old Razorpay subscription ${oldRazorpaySubscriptionId} for user ${userId} is already in '${status}'. Clearing local subscription details.`);
                        user.subscriptionStatus = status; 
                    }
                } catch (error) {
                    console.error(`Error managing Razorpay subscription ${oldRazorpaySubscriptionId} during downgrade to free for user ${userId}:`, error);
                    if (error.statusCode === 404) { 
                        console.warn(`Subscription ${oldRazorpaySubscriptionId} not found on Razorpay. Assuming already invalid for downgrade.`);
                    } else if (error.statusCode === 400 && error.description && error.description.includes("Subscription cannot be cancelled because it hasn't started yet.")) {
                         console.warn(`Tried to cancel a 'created' subscription ${oldRazorpaySubscriptionId} via API, which isn't the flow. Local downgrade proceeds.`);
                    }
                    user.subscriptionStatus = 'cancelled'; 
                }
            }
            user.currentPlan = 'free';
            user.razorpaySubscriptionId = null; 
            user.nextBillingDate = null;
            await user.save();
            return res.json({
                message: "Successfully changed to Free plan.",
                currentPlan: user.currentPlan,
                subscriptionStatus: user.subscriptionStatus 
            });
        }


        if (!user.razorpayCustomerId) {
            let sanitizedPhone = null;
            if (user.phone) {
                sanitizedPhone = user.phone.replace(/[^+\d]/g, '');
                if (sanitizedPhone.length < 6 || sanitizedPhone.length > 15) {
                    console.warn(`Sanitized phone number ${sanitizedPhone} for user ${user._id} seems invalid. Omitting for Razorpay customer creation.`);
                    sanitizedPhone = null;
                }
            }

            try {
                const razorpayCustomer = await createRazorpayCustomer(user.name, user.email, sanitizedPhone);
                user.razorpayCustomerId = razorpayCustomer.id;
                await user.save();
            } catch (error) {
                let customerAlreadyExistsError = false;

                if (error.statusCode === 400 && error.error && typeof error.error.description === 'string' && error.error.description.includes('Customer already exists for the merchant')) {
                    customerAlreadyExistsError = true;
                } else if (error.response && error.response.status === 400 &&
                         error.response.data && error.response.data.error &&
                         typeof error.response.data.error.description === 'string' &&
                         error.response.data.error.description.includes('Customer already exists for the merchant')) {
                    customerAlreadyExistsError = true;
                }

                if (customerAlreadyExistsError) {
                    console.warn(`Razorpay customer for user ${user._id} (${user.email}) already exists. Attempting to retrieve existing customer ID.`);
                    try {

                        const existingCustomer = await fetchRazorpayCustomerByEmail(user.email);
              
                        if (existingCustomer) {
                            user.razorpayCustomerId = existingCustomer.id; 
                            await user.save();
                            console.log(`Linked existing Razorpay customer ID ${existingCustomer.id} to user ${user._id}.`);
                        } else {
                            console.error(`Razorpay customer exists for ${user.email} but could not be found by specific email lookup.`);
                            return res.status(500).json({
                                message: "Failed to link existing Razorpay customer. Please contact support (customer ID lookup by email failed).",
                                error: process.env.NODE_ENV === 'development' ? 'Customer lookup by email returned no results.' : undefined,
                            });
                        }
                    } catch (lookupError) {
                        console.error(`Error during Razorpay customer lookup for user ${user._id}:`, lookupError);
                     
                        console.warn('Falling back to fetching all customers due to lookup error. This is inefficient.');
                        try {
                            const allCustomers = await razorpayInstance.customers.all({ count: 100 });
                            const foundCustomer = allCustomers.items.find(cust => cust.email === user.email);

                            if (foundCustomer) {
                                user.razorpayCustomerId = foundCustomer.id;
                                await user.save();
                                console.log(`Linked existing Razorpay customer ID ${foundCustomer.id} to user ${user._id} (via fallback).`);
                            } else {
                                console.error(`Razorpay customer exists for ${user.email} but could not be found by fallback email lookup either.`);
                                return res.status(500).json({
                                    message: "Failed to link existing Razorpay customer. Please contact support (fallback customer ID lookup failed).",
                                    error: process.env.NODE_ENV === 'development' ? (lookupError.message || JSON.stringify(lookupError)) : undefined,
                                });
                            }
                        } catch (fallbackLookupError) {
                             console.error(`Error during Razorpay fallback customer lookup for user ${user._id}:`, fallbackLookupError);
                             return res.status(500).json({
                                message: "Failed to link existing Razorpay customer. Please contact support (critical lookup error).",
                                error: process.env.NODE_ENV === 'development' ? (fallbackLookupError.message || JSON.stringify(fallbackLookupError)) : undefined,
                            });
                        }
                    }
                } else {
                     console.error(`Unexpected error during Razorpay customer creation for user ${user._id}:`, error);
                    return res.status(500).json({
                        message: "Failed to create Razorpay customer. Please try again.",
                        error: process.env.NODE_ENV === 'development' ? (error.message || JSON.stringify(error)) : undefined,
                    });
                }
            }
        }

 const razorpayPlanId = getRazorpayPlanId(newPlanId);
        if (!razorpayPlanId) {
            return res.status(400).json({ message: "Invalid or unsupported paid plan ID." });
        }

        const newSubscription = await createRazorpaySubscription(
            razorpayPlanId,
            user.razorpayCustomerId
        );

        user.razorpaySubscriptionId = newSubscription.id;
        user.currentPlan = newPlanId;
        user.subscriptionStatus = newSubscription.status;
        user.nextBillingDate = null;
        await user.save();

        res.status(200).json({
            message: `Subscription initiated for ${newPlanId}. Please complete payment.`,
            subscriptionId: newSubscription.id,
            status: newSubscription.status,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error(`Error in subscription change for user ${userId}:`, error);
        let errorMessage = "Subscription change failed. Please try again.";
        let statusCode = 500;

         if (error.statusCode && error.error && error.error.description) {
            statusCode = error.statusCode;
            errorMessage = error.error.description;
        } else if (error.statusCode && error.description) {
            statusCode = error.statusCode;
            errorMessage = error.description;
        } else if (error.response && error.response.data && error.response.data.error) {
            statusCode = error.response.status || 500;
            errorMessage = error.response.data.error.description || error.response.data.error.code || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        } else {
            errorMessage = `An unexpected error occurred: ${JSON.stringify(error)}`;
            statusCode = 500;
        }

        res.status(statusCode).json({
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? (error.message || JSON.stringify(error)) : undefined,
        });
    }
};

// @desc    Handle user subscription change (upgrade/downgrade/cancel)
// @route   POST /api/settings/billing/subscribe

const getBillingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "currentPlan subscriptionStatus nextBillingDate razorpaySubscriptionId"
    );
    if (!user) return res.status(404).json({ message: "User not found" }); 

          let needsSave = false;

   if (user.razorpaySubscriptionId) {
            try {
                const rzpSub = await fetchRazorpaySubscription(user.razorpaySubscriptionId);
                if (user.subscriptionStatus !== rzpSub.status) {
                    user.subscriptionStatus = rzpSub.status;
                    needsSave = true;
                }
                const newNextBillingDate = rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null;
                if (user.nextBillingDate?.getTime() !== newNextBillingDate?.getTime()) {
                    user.nextBillingDate = newNextBillingDate;
                    needsSave = true;
                }
                const terminalStatuses = ['cancelled', 'completed', 'expired'];
                if (terminalStatuses.includes(rzpSub.status) && user.currentPlan !== 'free') {
                    console.log(`BillingInfo: RPay sub ${user.razorpaySubscriptionId} is '${rzpSub.status}'. Downgrading ${user._id} to free.`);
                    user.currentPlan = 'free';
                    user.razorpaySubscriptionId = null; 
                    needsSave = true;
                }
            }  catch (razorpayError) {
                console.warn(`BillingInfo: Could not fetch Razorpay subscription ${user.razorpaySubscriptionId} for user ${user._id}:`, razorpayError.message);
                if (razorpayError.statusCode === 404 && user.currentPlan !== 'free') {
                    console.warn(`BillingInfo: RPay sub ${user.razorpaySubscriptionId} not found. Downgrading ${user._id} to free.`);
                    user.currentPlan = 'free';
                    user.subscriptionStatus = 'cancelled'; 
                    user.razorpaySubscriptionId = null;
                    user.nextBillingDate = null;
                    needsSave = true;
                }
            }
        } else {
           
            if (user.currentPlan !== 'free') {
                user.currentPlan = 'free';
                user.subscriptionStatus = 'active'; 
                user.nextBillingDate = null;
                needsSave = true;
            }
        }

        if (needsSave) {
            await user.save();
        }

        res.json({
            currentPlan: user.currentPlan,
            subscriptionStatus: user.subscriptionStatus,
            nextBillingDate: user.nextBillingDate,
            razorpaySubscriptionId: user.razorpaySubscriptionId,
        });
    } catch (error) {
        console.error("Error fetching billing info:", error);
        res.status(500).json({ message: "Server error fetching billing information." });
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

    case "subscription.expired":
    if (user && user.razorpaySubscriptionId === payload.subscription.entity.id) { 
        console.log(`Subscription ${payload.subscription.entity.id} expired for user ${user.email}. Downgrading to free if it was a paid plan.`);
        user.subscriptionStatus = "expired";
        if (user.currentPlan !== 'free') {
            user.currentPlan = "free";
        }
        user.razorpaySubscriptionId = null; 
        user.nextBillingDate = null;
    } else if (!user) {
        console.warn(`Webhook (subscription.expired): User not found for subscription ${payload.subscription.entity.id}`);
    }

      case "payment.failed":
    console.error(`Payment failed for user ${user ? user.email : `cust_id: ${payload.payment.entity.customer_id}`}. Payment ID: ${payload.payment.entity.id}`);
    const paymentEntity = payload.payment.entity;
    if (user && paymentEntity.subscription_id) {
        if (user.razorpaySubscriptionId === paymentEntity.subscription_id && user.subscriptionStatus === 'created') {
            console.log(`Initial payment failed for 'created' subscription ${paymentEntity.subscription_id} for user ${user.email}. Downgrading to free.`);
            user.subscriptionStatus = "failed_to_activate";
            user.currentPlan = "free";
            user.razorpaySubscriptionId = null; 
            user.nextBillingDate = null;
        }
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




const getBillingDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const mockBillingData = {
      currentPlan: "professional",
      subscriptionStatus: "active",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      razorpaySubscriptionId: "sub_QbSSx84eETPLNu",
    };

    res.json(mockBillingData);
  } catch (error) {
    console.error("Error fetching billing details:", error);
    res.status(500).json({ message: "Server error" });
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
 handleRazorpayWebhook,
 getBillingDetails,
};
