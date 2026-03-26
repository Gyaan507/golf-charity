const express = require('express');
const { executeMonthlyDraw, simulateMonthlyDraw  } = require('../controllers/drawController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🚨 ADMIN ONLY: Only the administrator can execute the draw
router.get('/simulate', requireAuth, requireRole('admin'), simulateMonthlyDraw); // New Simulation Route

router.post('/execute', requireAuth, requireRole('admin'), executeMonthlyDraw);

module.exports = router;