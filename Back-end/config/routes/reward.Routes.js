const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getRewards,
  redeemReward,
  getRewardHistory
} = require('../controllers/rewardController');

const router = express.Router();

router.get('/', protect, getRewards);
router.get('/history', protect, getRewardHistory);
router.post('/:id/redeem', protect, redeemReward);

module.exports = router;