const express = require('express');
const { getCharities, selectCharity } = require('../controllers/charityController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route: Anyone can see the directory
router.get('/', getCharities);

// Protected route: Only subscribers can select/update their charity
router.post('/select', requireAuth, requireRole('subscriber'), selectCharity);

module.exports = router;