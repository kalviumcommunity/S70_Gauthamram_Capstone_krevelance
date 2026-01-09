const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' }); // Adjusted path
const FinancialData = require('./models/FinancialData');
const AnalysisResult = require('./models/AnalysisResult');
const User = require('./models/user');

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        // 1. Find the main test user
        // Try finding the user by email if known, or just the first user
        // Assuming the user is the one logged in, which we don't know for sure here.
        // Let's find ALL users and check their data counts.
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`\n--- Checking User: ${user.email} (${user._id}) ---`);

            // 2. Check Financial Data count
            const count = await FinancialData.countDocuments({ user: user._id });
            console.log(`FinancialData count: ${count}`);

            if (count > 0) {
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
                console.log(`Aggregation Result (Dropdown): Found ${uploads.length} uploads.`);
                if (uploads.length === 0) {
                    console.log("WARNING: FinancialData exists but Aggregation returned 0. Checking field types...");
                    const sample = await FinancialData.findOne({ user: user._id });
                    console.log("Sample FinData User Field:", sample.user, "Type:", typeof sample.user);
                    console.log("User ID:", user._id, "Type:", typeof user._id);
                }
            } else {
                console.log("Skipping aggregation (No data).");
            }

            // 4. Check Analysis Result (Prediction logic)
            const analysis = await AnalysisResult.findOne({ user: user._id }).sort({ createdAt: -1 });
            if (analysis) {
                console.log("Latest Analysis Found.");
                if (analysis.predictions && analysis.predictions.monthlyForecast) {
                    console.log("Has Monthly Forecast? YES");
                    console.log("Forecast Length:", analysis.predictions.monthlyForecast.length);
                    // Print first item to verify structure
                    if (analysis.predictions.monthlyForecast.length > 0) {
                        console.log("Sample Forecast Item:", JSON.stringify(analysis.predictions.monthlyForecast[0]));
                    }
                } else {
                    console.log("Analysis found but NO monthlyForecast in predictions.");
                    console.log("Analysis Keys:", Object.keys(analysis.toObject()));
                    if (analysis.predictions) console.log("Prediction Keys:", Object.keys(analysis.predictions));
                }
            } else {
                console.log("No AnalysisResult found.");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
