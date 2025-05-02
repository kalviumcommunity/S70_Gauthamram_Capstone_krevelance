const asyncHandler = require('express-async-handler');
const { generateFinancialInsights, generateDetailedAIRecommendations } = require('../services/aiAnalysisService');

const getFinancialAnalysis = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userTier = req.user.tier || 'free';
    try {
        const rawData = await fetchUserFinancialData(userId); 
        const aggregatedData = aggregateDataForAnalysis(rawData);
        const summaryForAI = {
            monthlyRevenue: aggregatedData.revenueData, 
            monthlyExpenses: aggregatedData.expensesData,
        };
        const basicAnalysis = await generateFinancialInsights(summaryForAI);
        let detailedInsightsContent = null;
        if (userTier === 'pro' || userTier === 'enterprise') {
             detailedInsightsContent = await generateDetailedAIRecommendations(summaryForAI, userTier);
        } else {
             detailedInsightsContent = "Upgrade to Premium for detailed AI-powered recommendations.";
        }
        const responseData = {
            userTier: userTier,
            overview: {
                revenueData: aggregatedData.revenueData,
                expensesData: aggregatedData.expensesData,
                keyInsights: basicAnalysis.keyInsights || [], 
            },
            trends: {
                revenueForecast: basicAnalysis.revenueForecast || "N/A",
                expenseForecast: basicAnalysis.expenseForecast || "N/A",
                growthOpportunities: basicAnalysis.growthOpportunities || [],
            },
            aiInsights: {
                isAllowed: userTier === 'pro' || userTier === 'enterprise',
                content: detailedInsightsContent
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error fetching financial analysis:", error);
        res.status(500).json({ message: error.message || "Failed to fetch financial analysis" });
    }
});

async function fetchUserFinancialData(userId) {
    console.log(`Workspaceing data for user ${userId}...`);
     return {
         revenue: [4000, 6000, 8000, 10000, 12000, 16000, 18000, 20000, 19000, 22000, 25000, 30000],
         expenses: [2000, 2200, 3000, 4000, 4500, 5000, 5500, 6000, 5800, 6500, 7000, 7500]
    };
}

function aggregateDataForAnalysis(rawData) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
         revenueData: rawData.revenue.map((val, i) => ({ name: months[i], value: val })),
         expensesData: rawData.expenses.map((val, i) => ({ name: months[i], value: val }))
    };
}

module.exports = { getFinancialAnalysis };