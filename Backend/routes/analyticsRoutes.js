const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All analytics require admin access
router.get('/summary', verifyToken, isAdmin, analyticsController.getAnalyticsSummary);
router.get('/trends', verifyToken, isAdmin, analyticsController.getAnalyticsTrends);

module.exports = router;
