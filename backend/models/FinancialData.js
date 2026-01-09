const mongoose = require('mongoose');

const FinancialDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadId: { type: String, required: true }, // Batch ID for filtering
    year: {
        type: Number,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    },
    expenses: {
        type: Number,
        required: true
    },
    netProfit: {
        type: Number,
        required: true
    },
    churnRate: {
        type: Number,
        default: 0
    },
    metadata: {
        source: { type: String, enum: ['manual', 'upload', 'api'], default: 'manual' },
        documentType: {
            type: String,
            enum: ['audit', 'tax', 'bank', 'forecast', 'mis', 'other'],
            default: 'other'
        },
        confidenceScore: { type: Number, default: 1.0 }, 
        originalFileName: String,
        uploadDate: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

// Compound index to ensure unique data per year per upload
FinancialDataSchema.index({ user: 1, year: 1, uploadId: 1 }, { unique: true });

module.exports = mongoose.model('FinancialData', FinancialDataSchema);
