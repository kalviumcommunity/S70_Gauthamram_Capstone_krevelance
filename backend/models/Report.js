const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['financial', 'analysis', 'forecast', 'tax', 'other'], 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'failed'],
        default: 'pending'
    },
    format: {
        type: String,
        enum: ['pdf', 'xlsx', 'csv', 'docx'],
        required: true
    },
    filePath: String,
});

module.exports = mongoose.model('Report', reportSchema);