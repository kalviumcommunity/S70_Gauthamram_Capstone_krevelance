const mongoose = require('mongoose');
const ExpenseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true }, 

    description: { type: String },

    amount: { 
        type: Number, 
        required: true },

    category: { 
        type: String },

}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);