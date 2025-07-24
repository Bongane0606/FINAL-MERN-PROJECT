const express = require('express');
const { protect } = require('../middleware/auth');
const {
  startTrip,
  endTrip,
  getTrips,
  getTripSummary
} = require('../controllers/tripController');

const router = express.Router();

router.route('/')
  .post(protect, startTrip)
  .get(protect, getTrips);

router.put('/:id', protect, endTrip);
router.get('/summary', protect, getTripSummary);

module.exports = router;