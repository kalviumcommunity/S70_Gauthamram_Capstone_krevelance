const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the notification'],
    },
    message: {
        type: String,
        required: [true, 'Please add a message for the notification'],
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'], 
        default: 'info',
    },
    category: {
        type: String,
        enum: ['market', 'subscription', 'report', 'login', 'data', 'other'],
        default: 'other',
    },
    read: {
        type: Boolean,
        default: false, 
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);