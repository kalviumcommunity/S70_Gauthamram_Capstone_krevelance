const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController'); 
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardData);

module.exports = router;