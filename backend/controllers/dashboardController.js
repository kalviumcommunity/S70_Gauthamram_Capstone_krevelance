const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const { predictRetainedUsers } = require('../services/aiAnalysisService');

const getDashboardData = asyncHandler(async (req, res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalRevenueData,
        totalExpensesData,
        monthlyRevenueData,
        monthlyExpensesData,
        activeUsersCount, 
        revenueLastMonthData,
        expensesLastMonthData
    ] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Expense.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: { month: { $month: '$createdAt' } }, monthlyTotal: { $sum: '$amount' } } },
            { $sort: { '_id.month': 1 } }
        ]),
        Expense.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: { month: { $month: '$createdAt' } }, monthlyTotal: { $sum: '$amount' } } },
            { $sort: { '_id.month': 1 } }
        ]),
        User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Expense.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);

    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;
    const totalExpenses = totalExpensesData.length > 0 ? totalExpensesData[0].total : 0;
    const netProfit = totalRevenue - totalExpenses;

    const revenueLastMonth = revenueLastMonthData.length > 0 ? revenueLastMonthData[0].total : 0;
    const expensesLastMonth = expensesLastMonthData.length > 0 ? expensesLastMonthData[0].total : 0;
    const profitLastMonth = revenueLastMonth - expensesLastMonth;

    const currentMonthIndex = new Date().getMonth() + 1; 
    const revenueThisMonth = monthlyRevenueData.find(m => m._id.month === currentMonthIndex)?.monthlyTotal || 0;
    const expensesThisMonth = monthlyExpensesData.find(m => m._id.month === currentMonthIndex)?.monthlyTotal || 0;
    const profitThisMonth = revenueThisMonth - expensesThisMonth;

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        const change = ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(revenueThisMonth, revenueLastMonth);
    const expensesChange = calculateChange(expensesThisMonth, expensesLastMonth);
    const profitChange = calculateChange(profitThisMonth, profitLastMonth);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChart = monthNames.map((name, index) => {
        const monthData = monthlyRevenueData.find(item => item._id.month === index + 1);
        return { name, value: monthData ? monthData.monthlyTotal : 0 };
    });
    const profitChart = monthNames.map((name, index) => {
        const revenue = monthlyRevenueData.find(item => item._id.month === index + 1)?.monthlyTotal || 0;
        const expenses = monthlyExpensesData.find(item => item._id.month === index + 1)?.monthlyTotal || 0;
        return { name, value: revenue - expenses };
    });

    const historicalSummaryForAI = {
        totalRevenueYTD: totalRevenue,
        totalExpensesYTD: totalExpenses,
        netProfitYTD: netProfit,
        avgMonthlyRevenue: monthlyRevenueData.length > 0 ? (monthlyRevenueData.reduce((sum, m) => sum + m.monthlyTotal, 0) / monthlyRevenueData.length) : 0,
        avgMonthlyProfit: profitChart.length > 0 ? (profitChart.reduce((sum, m) => sum + m.value, 0) / profitChart.length) : 0,
    };

    const predictionTimeframe = '3m' || '6m' || '1y'; 

    const predictedRetainedUsersValue = await predictRetainedUsers(
        historicalSummaryForAI,
        activeUsersCount, 
        predictionTimeframe
    );

    const responseData = {
        stats: {
            totalRevenue: {
                value: totalRevenue,
                change: revenueChange,
                trend: revenueChange >= 0 ? 'up' : 'down'
            },
            totalExpenses: {
                value: totalExpenses,
                change: expensesChange,
                trend: expensesChange <= 0 ? 'down' : 'up' 
            },
            netProfit: {
                value: netProfit,
                change: profitChange,
                trend: profitChange >= 0 ? 'up' : 'down'
            },
            activeUsers: {
                value: predictedRetainedUsersValue, 
                change: null, 
                trend: null,
                predictionTimeframe: `${predictionTimeframe === '3m' || '6m' || '1y' ? '3 Months' || '6 Months' || '1 Year' : predictionTimeframe}` // Add context
            }
        },
        charts: {
            revenueData: revenueChart,
            profitData: profitChart
        }
    };

    res.status(200).json(responseData);
});

module.exports = {
    getDashboardData,
};