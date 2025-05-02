const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/reports',reportController.getAllReports);

router.get('/reports/view/:reportId', authMiddleware.protect, reportController.viewReport);

router.get('/reports/download/:reportId', authMiddleware.protect, reportController.downloadReport);

module.exports = router;