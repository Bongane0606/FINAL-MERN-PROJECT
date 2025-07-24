const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  category: { type: String, enum: ['fuel', 'retail', 'insurance', 'exclusive'], required: true },
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
  tierRestriction: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', null], default: null },
  expirationDate: { type: Date },
  redemptionCode: { type: String }
});

module.exports = mongoose.model('Reward', rewardSchema);