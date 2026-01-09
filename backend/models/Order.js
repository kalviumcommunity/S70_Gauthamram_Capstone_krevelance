const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadId: { type: String }, // Link to specific upload batch

    customerId: { type: String }, // For tracking unique customers

    amount: {
        type: Number,
        required: true
    },
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);