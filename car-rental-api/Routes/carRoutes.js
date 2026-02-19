// routes/carRoutes.js
// Routes CRUD pour les voitures.
// GET = public, POST/PUT/DELETE = admin uniquement.

const express = require('express');
const router = express.Router();

const {
  getAllCars,
  getReservedCarIds,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getDeletedCarsArchive
} = require('../controllers/carController');

const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const {
  carRules,
  carUpdateRules,
  mongoIdParam
} = require('../middlewares/validator');

// Routes publiques
router.get('/', getAllCars);
router.get('/reserved-ids', getReservedCarIds);
router.get('/:id', mongoIdParam, getCarById);

// Routes admin uniquement
router.get('/admin/archives/deleted', auth, role('admin'), getDeletedCarsArchive);
router.post('/', auth, role('admin'), carRules, createCar);
router.put('/:id', auth, role('admin'), mongoIdParam, carUpdateRules, updateCar);
router.delete('/:id', auth, role('admin'), mongoIdParam, deleteCar);

module.exports = router;
