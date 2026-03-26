const express = require('express');
const { getDashboardMetrics, getAllUsers } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Both routes require the user to be logged in AND have the 'admin' role
router.get('/metrics', requireAuth, requireRole('admin'), getDashboardMetrics);
router.get('/users', requireAuth, requireRole('admin'), getAllUsers);

module.exports = router;