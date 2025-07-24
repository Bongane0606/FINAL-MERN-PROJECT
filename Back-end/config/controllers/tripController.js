const Trip = require('../models/Trip');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { calculateSafetyScore, calculatePoints } = require('../utils/calculateScore');

// @desc    Start new trip
// @route   POST /api/trips
// @access  Private
const startTrip = asyncHandler(async (req, res) => {
  const { vehicleId } = req.body;

  const trip = new Trip({
    user: req.user._id,
    vehicle: vehicleId,
    startTime: new Date(),
    status: 'active'
  });

  const createdTrip = await trip.save();
  res.status(201).json(createdTrip);
});

// @desc    End trip
// @route   PUT /api/trips/:id
// @access  Private
const endTrip = asyncHandler(async (req, res) => {
  const { distance, duration, incidents, route, tripType } = req.body;

  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  // Calculate safety score and points
  const safetyScore = calculateSafetyScore(incidents || []);
  const user = await User.findById(req.user._id);
  const pointsEarned = calculatePoints(distance, safetyScore, user.tier);

  // Update trip
  trip.endTime = new Date();
  trip.distance = distance;
  trip.duration = duration;
  trip.safetyScore = safetyScore;
  trip.pointsEarned = pointsEarned;
  trip.incidents = incidents || [];
  trip.route = route || {};
  trip.tripType = tripType || 'other';
  trip.status = 'completed';

  const updatedTrip = await trip.save();

  // Update user stats
  const totalTrips = await Trip.countDocuments({ user: req.user._id, status: 'completed' });
  const newSafetyScore = Math.round(
    ((user.safetyScore * (totalTrips - 1)) + safetyScore) / totalTrips
  );
  
  user.safetyScore = newSafetyScore;
  user.rewardPoints += pointsEarned;
  
  // Update tier if needed
  if (user.rewardPoints >= 5000 && user.tier !== 'Platinum') {
    user.tier = 'Platinum';
  } else if (user.rewardPoints >= 2000 && user.tier !== 'Gold' && user.tier !== 'Platinum') {
    user.tier = 'Gold';
  } else if (user.rewardPoints >= 1000 && user.tier === 'Bronze') {
    user.tier = 'Silver';
  }
  
  await user.save();

  res.json(updatedTrip);
});

// @desc    Get user trips
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const { type, score, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = { user: req.user._id, status: 'completed' };

  if (type && type !== 'all') {
    query.tripType = type;
  }

  if (score && score !== 'all') {
    switch(score) {
      case 'excellent': query.safetyScore = { $gte: 90 }; break;
      case 'good': query.safetyScore = { $gte: 75, $lt: 90 }; break;
      case 'fair': query.safetyScore = { $gte: 60, $lt: 75 }; break;
      case 'poor': query.safetyScore = { $lt: 60 }; break;
    }
  }

  const trips = await Trip.find(query)
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('vehicle');

  const count = await Trip.countDocuments(query);

  res.json({
    trips,
    page: parseInt(page),
    pages: Math.ceil(count / limit),
    total: count
  });
});

// @desc    Get trip summary stats
// @route   GET /api/trips/summary
// @access  Private
const getTripSummary = asyncHandler(async (req, res) => {
  const stats = await Trip.aggregate([
    { $match: { user: req.user._id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalMiles: { $sum: "$distance" },
        totalDuration: { $sum: "$duration" },
        totalTrips: { $sum: 1 },
        avgScore: { $avg: "$safetyScore" },
        totalPoints: { $sum: "$pointsEarned" }
      }
    }
  ]);

  if (stats.length > 0) {
    res.json(stats[0]);
  } else {
    res.json({
      totalMiles: 0,
      totalDuration: 0,
      totalTrips: 0,
      avgScore: 0,
      totalPoints: 0
    });
  }
});

module.exports = {
  startTrip,
  endTrip,
  getTrips,
  getTripSummary
};