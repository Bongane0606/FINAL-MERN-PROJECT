const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: { type: String, enum: ['hard_braking', 'speeding', 'phone_usage', 'sharp_turn'], required: true },
  timestamp: { type: Date, required: true },
  location: String,
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  distance: { type: Number }, // in miles
  duration: { type: Number }, // in minutes
  safetyScore: { type: Number },
  pointsEarned: { type: Number },
  incidents: [incidentSchema],
  route: {
    startLocation: String,
    endLocation: String,
    waypoints: [String]
  },
  tripType: { type: String, enum: ['commute', 'errand', 'roadtrip', 'other'] },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);