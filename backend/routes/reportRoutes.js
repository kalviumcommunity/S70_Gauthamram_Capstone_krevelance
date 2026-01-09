const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.protect, reportController.getAllReports);


router.post('/generate', authMiddleware.protect, reportController.generateReport);

router.get('/view/:reportId', authMiddleware.protect, reportController.viewReport);

router.get('/download/:reportId', authMiddleware.protect, reportController.downloadReport);

module.exports = router;