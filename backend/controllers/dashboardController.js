const asyncHandler = require('express-async-handler'); 
const User = require('../models/user');
const Order = require('../models/Order'); 
const Expense = require('../models/Expense'); 
const { generateFinancialInsights, generateDetailedAIRecommendations } = require('../services/aiAnalysisService');

const getDashboardData = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)); 

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
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } }, 
                    monthlyTotal: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]),
         Expense.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } }, 
                    monthlyTotal: { $sum: '$amount' }
                }
            },
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

    const revenueThisMonth = monthlyRevenueData.find(m => m._id.month === (now.getMonth() + 1))?.monthlyTotal || 0;
    const expensesThisMonth = monthlyExpensesData.find(m => m._id.month === (now.getMonth() + 1))?.monthlyTotal || 0;
    const profitThisMonth = revenueThisMonth - expensesThisMonth;

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0; 
        return (((current - previous) / previous) * 100).toFixed(1); 
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


    const responseData = {
         stats: {
            totalRevenue: {
                value: totalRevenue,
                change: parseFloat(revenueChange),
                trend: revenueChange >= 0 ? 'up' : 'down'
            },
            totalExpenses: {
                value: totalExpenses,
                change: parseFloat(expensesChange),
                trend: expensesChange >= 0 ? 'up' : 'down'
            },
            netProfit: {
                value: netProfit,
                change: parseFloat(profitChange),
                trend: profitChange >= 0 ? 'up' : 'down'
            },
            activeUsers: {
                value: activeUsersCount,
                change: 0,
                trend: 'neutral'
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