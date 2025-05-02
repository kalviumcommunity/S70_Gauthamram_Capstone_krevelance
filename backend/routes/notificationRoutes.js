const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} = require('../controllers/notificationController'); 

router.route('/').get(protect, getNotifications);
router.route('/:id/read').put(protect, markNotificationAsRead);
router.route('/mark-all-read').put(protect, markAllNotificationsAsRead);
router.route('/:id').delete(protect, deleteNotification);


module.exports = router;