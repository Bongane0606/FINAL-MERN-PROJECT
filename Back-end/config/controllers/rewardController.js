const Reward = require('../models/Reward');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Private
const getRewards = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const user = await User.findById(req.user._id);

  let query = {};

  if (category && category !== 'all') {
    query.category = category;
  }

  // Filter rewards based on user tier
  query.$or = [
    { tierRestriction: null },
    { tierRestriction: user.tier },
    { tierRestriction: { $in: ['Bronze', 'Silver'].slice(0, ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(user.tier) + 1) } }
  ];

  const rewards = await Reward.find(query).sort({ pointsRequired: 1 });
  res.json(rewards);
});

// @desc    Redeem reward
// @route   POST /api/rewards/:id/redeem
// @access  Private
const redeemReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (!reward) {
    res.status(404);
    throw new Error('Reward not found');
  }

  // Check if user meets requirements
  if (user.rewardPoints < reward.pointsRequired) {
    res.status(400);
    throw new Error('Not enough points to redeem this reward');
  }

  if (reward.tierRestriction && reward.tierRestriction !== user.tier) {
    res.status(400);
    throw new Error('Your tier does not qualify for this reward');
  }

  // Deduct points and create redemption
  user.rewardPoints -= reward.pointsRequired;
  await user.save();

  res.json({
    message: `Successfully redeemed ${reward.name}`,
    redemptionCode: reward.redemptionCode || `SAFEDRIVE-${Date.now()}`,
    remainingPoints: user.rewardPoints
  });
});

// @desc    Get reward history
// @route   GET /api/rewards/history
// @access  Private
const getRewardHistory = asyncHandler(async (req, res) => {
  // In a full implementation, you would have a Redemption model
  // For now, we'll return a mock response matching your frontend
  res.json([
    {
      date: "Today",
      description: "Morning commute (Excellent)",
      points: "+15",
      balance: "1,250"
    },
    {
      date: "Yesterday",
      description: "Amazon gift card redemption",
      points: "-1,000",
      balance: "1,235"
    },
    {
      date: "Yesterday",
      description: "Afternoon errand (Good)",
      points: "+12",
      balance: "2,235"
    },
    {
      date: "Monday",
      description: "Weekly bonus (Silver tier)",
      points: "+50",
      balance: "2,223"
    },
    {
      date: "Sunday",
      description: "Weekend trip (Fair)",
      points: "+5",
      balance: "2,173"
    }
  ]);
});

module.exports = {
  getRewards,
  redeemReward,
  getRewardHistory
};