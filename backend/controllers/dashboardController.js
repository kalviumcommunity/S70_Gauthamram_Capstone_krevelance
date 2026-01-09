const asyncHandler = require('express-async-handler');
const AnalysisResult = require('../models/AnalysisResult');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const User = require('../models/user');
const { predictRetainedUsers } = require('../services/aiAnalysisService');

const getDashboardData = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        const { uploadId } = req.query;

        const query = { userId: req.user._id };
        const baseMatch = { userId: req.user._id };

        if (uploadId) {
            const ids = uploadId.split(',').map(id => id.trim());
            if (ids.length > 0) {
                const idQuery = { $in: ids };
                query.uploadId = idQuery;
                baseMatch.uploadId = idQuery;
            }
        }

        const lastOrder = await Order.findOne(query).sort({ createdAt: -1 });
        let targetYear = now.getFullYear();

        if (lastOrder) {
            targetYear = lastOrder.createdAt.getFullYear();
        }

        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);

        let referenceDate = now;
        if (targetYear < now.getFullYear()) {
            referenceDate = new Date(targetYear, 11, 31);
        }

        const startOfLastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
        const endOfLastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0, 23, 59, 59);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let analysisQuery = { user: req.user._id };

        if (uploadId) {
            console.log(`[Dashboard] Lookup Analysis for UploadID: ${uploadId}`);
            const ids = uploadId.split(',').map(id => id.trim());
            const relatedFinancialData = await require('../models/FinancialData').find({
                user: req.user._id,
                uploadId: { $in: ids }
            }).select('_id');

            const financialDataIds = relatedFinancialData.map(f => f._id);
            console.log(`[Dashboard] Found FinancialData IDs: ${financialDataIds.length}`);

            if (financialDataIds.length > 0) {
                analysisQuery['inputDataSnapshot.financialDataIds'] = { $in: financialDataIds };
            } else {
                console.log(`[Dashboard] No FinancialData found for IDs provided.`);
                analysisQuery = { _id: null };
            }
        }

        const detailedAnalysis = await AnalysisResult.findOne(analysisQuery)
            .sort({ createdAt: -1 })
            .select('predictions keyInsights inputDataSnapshot createdAt');

        console.log(`[Dashboard] DetailedAnalysis Found: ${!!detailedAnalysis}, Date: ${detailedAnalysis?.createdAt}`);

        if (detailedAnalysis) {
            const predKeys = detailedAnalysis.predictions ? Object.keys(detailedAnalysis.predictions) : 'No Predictions';
            const forecastLen = detailedAnalysis.predictions?.monthlyForecast?.length || 0;
            console.log(`[Dashboard] Prediction Keys: ${JSON.stringify(predKeys)}`);
            console.log(`[Dashboard] Forecast Data Length: ${forecastLen}`);
        }

        const [
            totalRevenueData,
            totalExpensesData,
            monthlyRevenueData,
            monthlyExpensesData,
            activeUsersCount,
            revenueLastMonthData,
            expensesLastMonthData
        ] = await Promise.all([
            // Total Revenue (YTD)
            Order.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Total Expenses (YTD)
            Expense.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Monthly Revenue
            Order.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
                { $group: { _id: { month: { $month: '$createdAt' } }, monthlyTotal: { $sum: '$amount' } } },
                { $sort: { '_id.month': 1 } }
            ]),
            // Monthly Expenses
            Expense.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
                { $group: { _id: { month: { $month: '$createdAt' } }, monthlyTotal: { $sum: '$amount' } } },
                { $sort: { '_id.month': 1 } }
            ]),
            // Active Users
            User.countDocuments({}),
            // Last Month Revenue
            Order.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last Month Expenses
            Expense.aggregate([
                { $match: { ...baseMatch, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const _totalRevenueData = totalRevenueData || [];
        const _totalExpensesData = totalExpensesData || [];
        const _revenueLastMonthData = revenueLastMonthData || [];
        const _expensesLastMonthData = expensesLastMonthData || [];

        const totalRevenue = _totalRevenueData.length > 0 ? _totalRevenueData[0].total : 0;
        const totalExpenses = _totalExpensesData.length > 0 ? _totalExpensesData[0].total : 0;
        const netProfit = totalRevenue - totalExpenses;

        const revenueLastMonth = _revenueLastMonthData.length > 0 ? _revenueLastMonthData[0].total : 0;
        const expensesLastMonth = _expensesLastMonthData.length > 0 ? _expensesLastMonthData[0].total : 0;
        const profitLastMonth = revenueLastMonth - expensesLastMonth;

        const currentMonthIndex = referenceDate.getMonth() + 1;
        const revenueThisMonth = monthlyRevenueData.find(m => m._id.month === currentMonthIndex)?.monthlyTotal || 0;
        const expensesThisMonth = monthlyExpensesData.find(m => m._id.month === currentMonthIndex)?.monthlyTotal || 0;
        const profitThisMonth = revenueThisMonth - expensesThisMonth;

        // --- Helper for Change Calculation ---
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueChange = calculateChange(revenueThisMonth, revenueLastMonth);
        const expensesChange = calculateChange(expensesThisMonth, expensesLastMonth);
        const profitChange = calculateChange(profitThisMonth, profitLastMonth);

        // --- Charts Logic ---
        let revenueDataFinal = [];
        let profitDataFinal = [];

        if (uploadId) {
            // --- CSV/Upload Mode ---
            const ids = uploadId.split(',').map(id => id.trim());
            const financialHistory = await require('../models/FinancialData').find({
                user: req.user._id,
                uploadId: { $in: ids }
            }).sort({ year: 1 });

            // Aggregate if multiple files, or just map if single
            const yearMap = new Map();
            financialHistory.forEach(record => {
                if (!yearMap.has(record.year)) {
                    yearMap.set(record.year, { revenue: 0, expenses: 0, netProfit: 0 });
                }
                const y = yearMap.get(record.year);
                y.revenue += (record.revenue || 0);
                y.expenses += (record.expenses || 0);
                y.netProfit += (record.netProfit || 0);
            });
            const sortedHistory = Array.from(yearMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([year, data]) => ({ year, ...data }));

            revenueDataFinal = sortedHistory.map(f => ({ name: f.year.toString(), value: f.revenue }));
            profitDataFinal = sortedHistory.map(f => ({ name: f.year.toString(), value: f.netProfit }));
        } else {
            // --- Default/System Mode ---
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            revenueDataFinal = monthNames.map((name, index) => {
                const monthData = monthlyRevenueData.find(item => item._id.month === index + 1);
                return { name, value: monthData ? monthData.monthlyTotal : 0 };
            });
            profitDataFinal = monthNames.map((name, index) => {
                const revenue = monthlyRevenueData.find(item => item._id.month === index + 1)?.monthlyTotal || 0;
                const expenses = monthlyExpensesData.find(item => item._id.month === index + 1)?.monthlyTotal || 0;
                return { name, value: revenue - expenses };
            });
        }

        // --- AI/Prediction Logic ---
        const historicalSummaryForAI = {
            totalRevenueYTD: totalRevenue,
            totalExpensesYTD: totalExpenses,
            netProfitYTD: netProfit,
            avgMonthlyRevenue: revenueDataFinal.length > 0 ? (revenueDataFinal.reduce((sum, m) => sum + m.value, 0) / revenueDataFinal.length) : 0,
            avgMonthlyProfit: profitDataFinal.length > 0 ? (profitDataFinal.reduce((sum, m) => sum + m.value, 0) / profitDataFinal.length) : 0,
        };

        const predictedRetainedUsersValue = await predictRetainedUsers(
            historicalSummaryForAI,
            activeUsersCount,
            '3m'
        );

        const responseData = {
            stats: {
                lastAnalysisDate: detailedAnalysis ? detailedAnalysis.createdAt : null,
                totalRevenue: {
                    value: totalRevenue,
                    change: revenueChange,
                    trend: revenueChange >= 0 ? 'up' : 'down'
                },
                totalExpenses: {
                    value: totalExpenses,
                    change: expensesChange,
                    trend: expensesChange <= 0 ? 'down' : 'up' // Lower expenses is 'up' trend (good) usually, or just visually up/down? Assuming direction of value.
                    // Assuming standard: strictly value direction. If -10% change, trend down.
                },
                netProfit: {
                    value: netProfit,
                    change: profitChange,
                    trend: profitChange >= 0 ? 'up' : 'down'
                },
                activeUsers: {
                    value: predictedRetainedUsersValue, // Using the prediction result
                    change: null, // No historical data for users easily available here without more agg
                    trend: null,
                    predictionTimeframe: '3 Months'
                }
            },
            charts: {
                revenueData: revenueDataFinal,
                profitData: profitDataFinal,
                forecastData: detailedAnalysis?.predictions?.monthlyForecast || []
            },
            predictions: detailedAnalysis?.predictions || {}
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});

module.exports = {
    getDashboardData,
};
