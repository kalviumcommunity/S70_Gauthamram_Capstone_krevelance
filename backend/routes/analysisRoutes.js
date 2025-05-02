const express = require('express');
const router = express.Router();
const { getFinancialAnalysis } = require('../controllers/analysisController'); 
const { protect } = require('../middleware/authMiddleware'); 

router.get('/financials', protect, getFinancialAnalysis);

module.exports = router;
