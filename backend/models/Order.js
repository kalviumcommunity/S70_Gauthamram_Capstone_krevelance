const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },

    amount: { 
        type: Number, 
        required: true },
}, { timestamps: true }); 
module.exports = mongoose.model('Order', OrderSchema);