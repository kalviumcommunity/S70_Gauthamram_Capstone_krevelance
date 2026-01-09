const mongoose = require('mongoose');
const FinancialData = require('./models/FinancialData');
const User = require('./models/user');
require('dotenv').config();

const checkUploads = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'gauthamram.um@gmail.com' });
        if (!user) {
            console.log("User not found");
            return;
        }

        console.log(`Checking uploads for user: ${user._id} (${user.email})`);

        const uploads = await FinancialData.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: "$uploadId",
                    fileName: { $first: "$metadata.originalFileName" },
                    docType: { $first: "$metadata.documentType" },
                    count: { $sum: 1 },
                    date: { $first: "$createdAt" }
                }
            },
            { $sort: { date: -1 } }
        ]);

        console.log("Found Uploads:");
        console.table(uploads);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUploads();
