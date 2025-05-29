const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');
const {getProfileSettings,updateProfileSettings,updatePassword,requestAccountDeletion,confirmAccountDeletion, dashboardprofile,
      getBillingInfo, 
  handleSubscriptionChange,
  handleRazorpayWebhook 
    // createSubscription, 
    // cancelSubscription, 
    // getInvoices,
} = require('../controllers/settingsController');

router.route('/profile').get(protect, getProfileSettings).put(protect, updateProfileSettings);
router.put('/password', protect, updatePassword);

router.post('/delete-account-request', protect, requestAccountDeletion);
router.get('/confirm-delete-account', confirmAccountDeletion);

router.get('/dashboardprofile', protect, dashboardprofile)

router.get('/billing', protect, getBillingInfo);
router.post('/billing/subscribe', protect, handleSubscriptionChange); 
router.post('/billing/razorpay-webhook', handleRazorpayWebhook); 


module.exports = router;