const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');
const {getProfileSettings,updateProfileSettings,updatePassword,requestAccountDeletion,confirmAccountDeletion, dashboardprofile,
      getBillingInfo, handleSubscriptionChange, handleRazorpayWebhook 
    // createSubscription, 
    // cancelSubscription, 
    // getInvoices,
} = require('../controllers/settingsController');

// User profile route
router.route('/profile').get(protect, getProfileSettings).put(protect, updateProfileSettings);

// Password route
router.put('/password', protect, updatePassword);

//account deletion routes
router.post('/delete-account-request', protect, requestAccountDeletion);
router.get('/confirm-delete-account', confirmAccountDeletion);

// Dashboard profile route
router.get('/dashboardprofile', protect, dashboardprofile)

// Billing routes
router.get('/billing', protect, getBillingInfo);
router.post('/billing/subscribe', protect, handleSubscriptionChange); 
router.post('/billing/razorpay-webhook', handleRazorpayWebhook); 


module.exports = router;