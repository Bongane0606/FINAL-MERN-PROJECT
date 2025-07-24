const Vehicle = require('../models/Vehicle');
const asyncHandler = require('express-async-handler');

// @desc    Get user vehicles
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.user._id });
  res.json(vehicles);
});

// @desc    Add new vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, vin, connectionType, deviceId } = req.body;

  const vehicle = new Vehicle({
    user: req.user._id,
    make,
    model,
    year,
    vin,
    connectionType,
    deviceId
  });

  const createdVehicle = await vehicle.save();
  
  // Add vehicle to user's vehicles array
  const user = await User.findById(req.user._id);
  user.vehicles.push(createdVehicle._id);
  await user.save();

  res.status(201).json(createdVehicle);
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, odometer, lastService } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.make = make || vehicle.make;
  vehicle.model = model || vehicle.model;
  vehicle.year = year || vehicle.year;
  vehicle.odometer = odometer || vehicle.odometer;
  vehicle.lastService = lastService || vehicle.lastService;

  const updatedVehicle = await vehicle.save();
  res.json(updatedVehicle);
});

// @desc    Get vehicle health
// @route   GET /api/vehicles/:id/health
// @access  Private
const getVehicleHealth = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  res.json({
    overall: vehicle.healthStatus,
    maintenance: vehicle.maintenance,
    alerts: vehicle.alerts.filter(alert => !alert.resolved)
  });
});

// @desc    Add maintenance record
// @route   POST /api/vehicles/:id/maintenance
// @access  Private
const addMaintenance = asyncHandler(async (req, res) => {
  const { type, dueDate, dueMileage, notes } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.maintenance.push({
    type,
    dueDate,
    dueMileage,
    notes
  });

  await vehicle.save();
  res.status(201).json(vehicle);
});

// @desc    Resolve alert
// @route   PUT /api/vehicles/:id/alerts/:alertId/resolve
// @access  Private
const resolveAlert = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const alert = vehicle.alerts.id(req.params.alertId);
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  alert.resolved = true;
  await vehicle.save();

  res.json({ message: 'Alert resolved successfully' });
});

module.exports = {
  getVehicles,
  addVehicle,
  updateVehicle,
  getVehicleHealth,
  addMaintenance,
  resolveAlert
};