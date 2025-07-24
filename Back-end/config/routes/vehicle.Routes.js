const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getVehicles,
  addVehicle,
  updateVehicle,
  getVehicleHealth,
  addMaintenance,
  resolveAlert
} = require('../controllers/vehicleController');

const router = express.Router();

router.route('/')
  .get(protect, getVehicles)
  .post(protect, addVehicle);

router.route('/:id')
  .put(protect, updateVehicle);

router.get('/:id/health', protect, getVehicleHealth);
router.post('/:id/maintenance', protect, addMaintenance);
router.put('/:id/alerts/:alertId/resolve', protect, resolveAlert);

module.exports = router;