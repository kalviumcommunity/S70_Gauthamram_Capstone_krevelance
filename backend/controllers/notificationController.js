
const asyncHandler = require('express-async-handler');
const Notification = require('../models/notification');


const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
                                            .sort({ createdAt: -1 }); 

    res.status(200).json(notifications);
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;

    const notification = await Notification.findOne({ _id: notificationId, user: req.user._id });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or does not belong to user');
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notificationId: notification._id });
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
        { user: req.user._id, read: false }, 
        { $set: { read: true } }
    );

    res.status(200).json({ message: `${result.modifiedCount} notifications marked as read` });
});

const deleteNotification = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, user: req.user._id });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or does not belong to user');
    }

    res.status(200).json({ message: 'Notification deleted', notificationId: notification._id });
});


module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};