const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  dueDate: { type: Date, required: true },
  dueMileage: { type: Number },
  lastCompleted: { type: Date },
  lastMileage: { type: Number },
  notes: String
});

const alertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
});

const vehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  vin: { type: String, unique: true },
  odometer: { type: Number },
  lastService: { type: Date },
  fuelEfficiency: { type: Number }, // MPG
  connectionType: { type: String, enum: ['OBD-II', 'Phone'], required: true },
  deviceId: { type: String },
  maintenance: [maintenanceSchema],
  alerts: [alertSchema],
  healthStatus: {
    engine: { type: String, enum: ['optimal', 'warning', 'critical'], default: 'optimal' },
    tires: { type: String, enum: ['optimal', 'warning', 'critical'], default: 'optimal' },
    battery: { type: String, enum: ['optimal', 'warning', 'critical'], default: 'optimal' },
    fluids: { type: String, enum: ['optimal', 'warning', 'critical'], default: 'optimal' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);