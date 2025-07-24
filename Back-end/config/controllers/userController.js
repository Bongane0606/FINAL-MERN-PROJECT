const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const { calculatePoints } = require('../utils/calculateScore');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate('vehicles');

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      safetyScore: user.safetyScore,
      rewardPoints: user.rewardPoints,
      tier: user.tier,
      vehicles: user.vehicles,
      completedQuiz: user.completedQuiz,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('vehicles');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      safetyScore: user.safetyScore,
      rewardPoints: user.rewardPoints,
      tier: user.tier,
      vehicles: user.vehicles,
      completedQuiz: user.completedQuiz
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Complete safety quiz
// @route   PUT /api/users/complete-quiz
// @access  Private
const completeQuiz = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.completedQuiz = true;
    user.rewardPoints += 100; // Award 100 points for completing quiz
    
    // Update tier if needed
    if (user.rewardPoints >= 1000 && user.tier === 'Bronze') {
      user.tier = 'Silver';
    }
    
    await user.save();
    
    res.json({
      message: 'Quiz completed! 100 points awarded',
      rewardPoints: user.rewardPoints,
      tier: user.tier
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  completeQuiz
};