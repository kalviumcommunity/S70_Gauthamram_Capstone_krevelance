const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    inputDataSnapshot: {
        financialDataIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FinancialData' }],
        marketDataSummary: mongoose.Schema.Types.Mixed
    },
    predictions: {
        revenue: String,
        expenses: String,
        netProfit: String,
        churnRate: String,
        growthPercentage: String,
        monthlyForecast: [{
            month: String,
            revenue: Number,
            profit: Number
        }]
    },
    keyInsights: [{
        title: String,
        description: String,
        type: { type: String, enum: ['positive', 'warning', 'info'] },
        icon: String
    }],
    growthOpportunities: [{
        title: String,
        description: String
    }],
    detailedAnalysis: String, // Full text response from Gemini
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
