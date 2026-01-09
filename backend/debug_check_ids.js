const mongoose = require('mongoose');
const FinancialData = require('./models/FinancialData');
const User = require('./models/user');
require('dotenv').config({ path: 'backend/.env' });

const checkIDs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const targetIds = ['695763143e0d681c05837ccc', '69569dfc9c56864f09ea8a72'];

        console.log("Checking for Upload IDs:", targetIds);

        const count = await FinancialData.countDocuments({
            uploadId: { $in: targetIds }
        });

        console.log(`Found ${count} records matching these IDs.`);

        if (count === 0) {
            console.log("Dumping all available uploadIds for user...");
            const user = await User.findOne({ email: 'gauthamram.um@gmail.com' });
            if (user) {
                const allData = await FinancialData.find({ user: user._id }).distinct('uploadId');
                console.log("Available Upload IDs:", allData);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkIDs();
