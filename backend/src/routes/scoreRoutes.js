const express = require('express');
const { addScore, getMyScores } = require('../controllers/scoreController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/',requireAuth,async (requireAuth,res)=>{
  const {date,courseName, strokes, stablefordPoints} = req.body;
  if (stablefordPoints < 1 || stablefordPoints > 45) {
      return res.status(400).json({ error: 'Stableford points must be between 1 and 45.' });
  }
})
router.post('/add', requireAuth, requireRole('subscriber'), addScore);
router.get('/', requireAuth, requireRole('subscriber'), getMyScores);

module.exports = router;