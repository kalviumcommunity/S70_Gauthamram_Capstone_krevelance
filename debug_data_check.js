const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const FinancialData = require('./backend/models/FinancialData');
const AnalysisResult = require('./backend/models/AnalysisResult');
const User = require('./backend/models/user');

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        // 1. Find the main test user
        const user = await User.findOne({ email: "gautham@example.com" }) || await User.findOne({});
        if (!user) {
            console.log("No user found");
            return;
        }
        console.log(`User found: ${user.email} (${user._id})`);

        // 2. Check Financial Data count
        const count = await FinancialData.countDocuments({ user: user._id });
        console.log(`FinancialData count: ${count}`);

        // 3. Test Aggregation (Dropdown logic)
        const uploads = await FinancialData.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: "$uploadId",
                    originalFileName: { $first: "$metadata.originalFileName" },
                    uploadDate: { $first: "$metadata.uploadDate" }
                }
            },
            { $sort: { uploadDate: -1 } }
        ]);
        console.log("Aggregation Result (Dropdown):", JSON.stringify(uploads, null, 2));

        // 4. Check Analysis Result (Prediction logic)
        const analysis = await AnalysisResult.findOne({ user: user._id }).sort({ createdAt: -1 });
        if (analysis) {
            console.log("Latest Analysis Found.");
            if (analysis.predictions && analysis.predictions.monthlyForecast) {
                console.log("Monthly Forecast Data:");
                console.log(JSON.stringify(analysis.predictions.monthlyForecast, null, 2));
            } else {
                console.log("Analysis found but NO monthlyForecast in predictions.");
                console.log("Keys in predictions:", analysis.predictions ? Object.keys(analysis.predictions) : "No predictions object");
            }
        } else {
            console.log("No AnalysisResult found for this user.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
