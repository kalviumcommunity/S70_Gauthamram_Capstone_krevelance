const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const fetchRazorpayCustomerByEmail = async (email) => {
    try {
       
const customers = await razorpayInstance.customers.all({ count: 100 }); 
        const foundCustomer = customers.items.find(cust => cust.email && cust.email.toLowerCase() === email.toLowerCase());

       if (foundCustomer) {
            return foundCustomer; 
        }

        return null;
    } catch (error) {
        console.error("Razorpay fetch customer by email error:", error);
        throw error;
    }
};

const createCustomer = async (name, email, phone) => {
    try {
         const customerPayload = {
            name, email,
        };
        if (phone) {
            customerPayload.contact = phone;
        }
        const customer = await razorpayInstance.customers.create(customerPayload);
        return customer;
    } catch (error) {
        console.error("Razorpay create customer error:", error);
        throw error;
    }
};

const createSubscription = async (planIdString, customerId, totalCount = 24) => {
    try {
        const razorpayPlanId = getRazorpayPlanId(planIdString);
        if (!razorpayPlanId) {
            if (planIdString === 'free') {
                return { id: null, status: 'active', short_url: null, message: 'No Razorpay subscription created for Free plan.' };
            }
            throw new Error('Invalid plan ID for Razorpay.');
        }

        const subscription = await razorpayInstance.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_id: customerId,
            total_count: totalCount,
            quantity: 1,
            customer_notify: 1,
            notes: {
                app_plan: planIdString,
                userId: customerId,
            },
        });
        return subscription;
    } catch (error) {
        console.error("Razorpay create subscription error:", error);
        throw error;
    }
};


const cancelSubscription = async (razorpaySubscriptionId, cancelAtCycleEnd = true) => {
    try {
        const subscription = await razorpayInstance.subscriptions.fetch(razorpaySubscriptionId);

        if (subscription.status === "created") {
            throw {
                statusCode: 400,
                description: "Subscription cannot be cancelled because it hasn't started yet.",
            };
        }

        const cancelled = await razorpayInstance.subscriptions.cancel(razorpaySubscriptionId, { cancel_at_cycle_end: cancelAtCycleEnd });
        return cancelled;
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
    if (appPlanId.startsWith('plan_')) return appPlanId;

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
     fetchRazorpayCustomerByEmail,
};