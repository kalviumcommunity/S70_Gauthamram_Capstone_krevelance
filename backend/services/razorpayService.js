const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createCustomer = async (name, email, phone) => {
    try {
        const customer = await razorpayInstance.customers.create({
            name,
            email,
            contact: phone,
        });
        return customer;
    } catch (error) {
        console.error("Razorpay create customer error:", error);
        throw error;
    }
};
const createSubscription = async (planIdString, customerId, totalCount = 24 ) => {
    try {
        const razorpayPlanId = getRazorpayPlanId(planIdString); 
        if (!razorpayPlanId) throw new Error('Invalid plan ID for Razorpay.');

        const subscription = await razorpayInstance.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_id: customerId,
            total_count: totalCount,
            quantity: 1,
        });
        return subscription;
    } catch (error) {
        console.error("Razorpay create subscription error:", error);
        throw error;
    }
};

const cancelSubscription = async (razorpaySubscriptionId, cancelAtCycleEnd = true) => {
    try {
        const subscription = await razorpayInstance.subscriptions.cancel(razorpaySubscriptionId, cancelAtCycleEnd);
        return subscription;
    } catch (error) {
        console.error("Razorpay cancel subscription error:", error);
        throw error;
    }
};
const fetchSubscription = async (razorpaySubscriptionId) => {
    try {
        const subscription = await razorpayInstance.subscriptions.fetch(razorpaySubscriptionId);
        return subscription;
    } catch (error) {
        console.error("Razorpay fetch subscription error:", error);
        throw error;
    }
};

function getRazorpayPlanId(appPlanId) {
    const planMap = {
        'free': null,
        'pro': process.env.RAZORPAY_PRO_PLAN_ID,  
        'enterprise': process.env.RAZORPAY_ENTERPRISE_PLAN_ID, 
    };
    return planMap[appPlanId];
}

// TODO: Add functions for fetching invoices, handling webhooks for payment success/failure

module.exports = {
    razorpayInstance,
    createCustomer,
    createSubscription,
    cancelSubscription,
    fetchSubscription,
    getRazorpayPlanId,
};