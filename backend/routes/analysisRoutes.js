const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer for local file storage (temp)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './'); // Save to root temporarily, sdmService will delete it
    },
    filename: (req, file, cb) => {
        cb(null, `temp-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.post('/upload', authMiddleware.protect, upload.single('file'), analysisController.uploadFinancialData);
router.post('/analyze', authMiddleware.protect, analysisController.performAnalysis);
// Get analysis results
router.get('/financials', authMiddleware.protect, analysisController.getFinancialAnalysis);

// Get upload history for dropdown
router.get('/history', authMiddleware.protect, analysisController.getUploadHistory);

module.exports = router;
