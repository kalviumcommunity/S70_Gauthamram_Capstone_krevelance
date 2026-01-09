const asyncHandler = require('express-async-handler');
const { generateFinancialInsights, generateDetailedAIRecommendations, performAdvancedAnalysis } = require('../services/aiAnalysisService');
const { structureFinancialData } = require('../services/sdmService');
const { getMarketTrendData } = require('../services/marketDataService');
const FinancialData = require('../models/FinancialData');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const AnalysisResult = require('../models/AnalysisResult');
const User = require('../models/user');
const mongoose = require('mongoose');

const uploadFinancialData = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        const userId = req.user._id;
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const documentType = req.body.documentType || 'other';

        console.log(`[Upload] Received file: ${req.file.originalname} (${mimeType}), Type: ${documentType}`);
        const existingFile = await FinancialData.findOne({
            user: userId,
            'metadata.originalFileName': req.file.originalname
        });

        if (existingFile) {
            res.status(409); // Conflict
            throw new Error(`File "${req.file.originalname}" has already been uploaded.`);
        }

        const uploadId = new mongoose.Types.ObjectId().toString();

        const structuredData = await structureFinancialData(filePath, mimeType, documentType);

        if (!structuredData || structuredData.length === 0) {
            res.status(400);
            throw new Error('Could not extract valid financial data from file');
        }

        const financialRecords = [];
        const orders = [];
        const expenses = [];

        for (const record of structuredData) {
            // Validate required fields
            if (record.year === undefined || record.revenue === undefined || record.expenses === undefined) {
                console.warn(`[Upload] Skipping invalid record:`, record);
                continue;
            }

            // Ensure numeric values
            const validRevenue = Number(record.revenue) || 0;
            const validExpenses = Number(record.expenses) || 0;
            const validProfit = record.netProfit !== undefined ? Number(record.netProfit) : (validRevenue - validExpenses);

            financialRecords.push({
                ...record,
                revenue: validRevenue,
                expenses: validExpenses,
                netProfit: validProfit,
                user: userId,
                uploadId: uploadId,
                metadata: {
                    source: 'upload',
                    originalFileName: req.file.originalname,
                    uploadDate: new Date(),
                    documentType: documentType // Store type
                }
            });

            if (record.year) {
                const monthlyRevenue = record.revenue / 12;
                const monthlyExpense = record.expenses / 12;

                for (let i = 0; i < 12; i++) {
                    const monthDate = new Date(record.year, i, 15);

                    const variation = 0.95 + Math.random() * 0.1;
                    const adjRevenue = monthlyRevenue * variation;
                    const adjExpense = monthlyExpense * variation;

                    if (monthlyRevenue > 0) {
                        orders.push({
                            userId: userId,
                            uploadId: uploadId,
                            amount: adjRevenue,
                            status: 'completed',
                            createdAt: monthDate
                        });
                    }

                    if (monthlyExpense > 0) {
                        expenses.push({
                            userId: userId,
                            uploadId: uploadId,
                            amount: adjExpense,
                            category: 'Operational',
                            description: 'Monthly allocated expense',
                            createdAt: monthDate
                        });
                    }
                }
            }
        }

        await Promise.all([
            FinancialData.insertMany(financialRecords),
            orders.length > 0 ? Order.insertMany(orders) : Promise.resolve(),
            expenses.length > 0 ? Expense.insertMany(expenses) : Promise.resolve()
        ]);

        res.status(200).json({
            message: 'Financial data processed and dashboard updated successfully',
            count: financialRecords.length,
            uploadId: uploadId,
            data: financialRecords
        });

    } catch (error) {
        console.error("Upload process error:", error);
        res.status(500);
        throw new Error('File processing failed: ' + error.message);
    }
});

const performAnalysis = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { uploadId } = req.query;
    const user = await User.findById(userId);

    const query = { user: userId };
    if (uploadId) {
        const ids = uploadId.split(',').map(id => id.trim()); // Trim whitespace
        if (ids.length > 0) query.uploadId = { $in: ids };
    }

    console.log(`[Analysis] Perform Analysis Query:`, JSON.stringify(query)); // Debug Log

    const financialHistory = await FinancialData.find(query).sort({ year: 1 });

    if (financialHistory.length === 0) {
        res.status(404);
        throw new Error('No financial data found. Please upload data first.');
    }

    // Merge/Aggregate data by year for AI Analysis
    // (If mulitple files selected, we sum up their values for the same year)
    const aggregatedHistoryMap = new Map();
    financialHistory.forEach(record => {
        if (!aggregatedHistoryMap.has(record.year)) {
            aggregatedHistoryMap.set(record.year, {
                year: record.year,
                revenue: 0,
                expenses: 0,
                netProfit: 0
            });
        }
        const y = aggregatedHistoryMap.get(record.year);
        y.revenue += (record.revenue || 0);
        y.expenses += (record.expenses || 0);
        y.netProfit += (record.netProfit || 0);
    });
    const aggregatedHistory = Array.from(aggregatedHistoryMap.values()).sort((a, b) => a.year - b.year);

    console.log(`[Analysis] Aggregated into ${aggregatedHistory.length} years for AI.`);

    const marketData = await getMarketTrendData(user.businessSector);

    const analysisResult = await performAdvancedAnalysis(aggregatedHistory, marketData);

    const savedResult = await AnalysisResult.create({
        user: userId,
        inputDataSnapshot: {
            financialDataIds: financialHistory.map(f => f._id),
            marketDataSummary: marketData
        },
        predictions: analysisResult.predictions,
        keyInsights: analysisResult.keyInsights,
        growthOpportunities: analysisResult.growthOpportunities,
        detailedAnalysis: analysisResult.detailedAnalysis,
        status: 'completed'
    });

    res.json({
        result: savedResult,
        marketDataUsed: marketData
    });
});

const getFinancialAnalysis = asyncHandler(async (req, res) => {
    const { uploadId } = req.query;

    const query = { user: req.user._id };
    let isMultiSelect = false;

    if (uploadId) {
        const ids = uploadId.split(',').map(id => id.trim());
        if (ids.length > 0) {
            query.uploadId = { $in: ids };
            if (ids.length > 1) isMultiSelect = true; // Flag to trigger aggregation
        }
    }

    // --- Find Matching Analysis (Specific to Selection) ---
    let analysisQuery = { user: req.user._id };
    if (uploadId) {
        // If filtering by specific file(s), ensure we get the analysis FOR those files
        // (Reusing logic from Dashboard for consistency)
        const ids = uploadId.split(',').map(id => id.trim());
        const relatedFinancialData = await FinancialData.find({
            user: req.user._id,
            uploadId: { $in: ids }
        }).select('_id');
        const fIds = relatedFinancialData.map(f => f._id);

        if (fIds.length > 0) {
            analysisQuery['inputDataSnapshot.financialDataIds'] = { $in: fIds };
        }
    }

    const latestAnalysis = await AnalysisResult.findOne(analysisQuery).sort({ createdAt: -1 });
    const financialHistory = await FinancialData.find(query).sort({ year: 1 });

    const userTier = req.user.tier || 'free';

    let processedHistory = [];
    // If specific SINGLE file, use raw data. If multiple files (or ALL), aggregate by year.
    if (uploadId && !isMultiSelect) {
        processedHistory = financialHistory;
    } else {
        const yearMap = new Map();
        financialHistory.forEach(record => {
            if (!yearMap.has(record.year)) {
                yearMap.set(record.year, { ...record._doc, revenue: 0, expenses: 0, netProfit: 0 });
            }
            const y = yearMap.get(record.year);
            y.revenue += (record.revenue || 0);
            y.expenses += (record.expenses || 0);
            y.netProfit += (record.netProfit || 0);
        });
        processedHistory = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    }


    const responseData = {
        userTier: userTier,
        analysisDate: latestAnalysis ? latestAnalysis.createdAt : null, // Send the actual Analysis Date
        overview: {
            revenueData: processedHistory.map(f => ({ name: f.year.toString(), value: f.revenue })),
            expensesData: processedHistory.map(f => ({ name: f.year.toString(), value: f.expenses })),
            keyInsights: latestAnalysis ? latestAnalysis.keyInsights : []
        },
        trends: {
            revenueForecast: latestAnalysis ? latestAnalysis.predictions.revenue : "No analysis run yet.",
            expenseForecast: latestAnalysis ? latestAnalysis.predictions.expenses : "No analysis run yet.",
            netProfitForecast: (latestAnalysis && latestAnalysis.predictions && latestAnalysis.predictions.netProfit) || "N/A",
            churnForecast: (latestAnalysis && latestAnalysis.predictions && latestAnalysis.predictions.churnRate) || "N/A",
            growthPercentage: (latestAnalysis && latestAnalysis.predictions && latestAnalysis.predictions.growthPercentage) || "N/A",
            monthlyForecast: (latestAnalysis && latestAnalysis.predictions && latestAnalysis.predictions.monthlyForecast) || [],
            growthOpportunities: (latestAnalysis && latestAnalysis.growthOpportunities) || []
        },
        aiInsights: {
            isAllowed: userTier === 'pro' || userTier === 'enterprise',
            content: latestAnalysis ? latestAnalysis.detailedAnalysis : "Run analysis to generate insights."
        },
        metadata: financialHistory.length > 0 ? financialHistory[financialHistory.length - 1].metadata : null
    };

    res.json(responseData);
});

const getUploadHistory = asyncHandler(async (req, res) => {
    const uploads = await FinancialData.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $group: {
                _id: "$uploadId",
                originalFileName: { $first: "$metadata.originalFileName" },
                uploadDate: { $first: "$metadata.uploadDate" }
            }
        },
        { $sort: { uploadDate: -1 } }
    ]);

    console.log(`[History] Uploads found for user ${req.user._id}: ${uploads.length}`);
    res.json(uploads);
});

module.exports = {
    uploadFinancialData,
    performAnalysis,
    getFinancialAnalysis,
    getUploadHistory
};