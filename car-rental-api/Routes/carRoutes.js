// routes/carRoutes.js
// Routes CRUD pour les voitures.
// GET = public, POST/PUT/DELETE = admin uniquement.

const express = require('express');
const router = express.Router();

const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
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
router.get('/:id', mongoIdParam, getCarById);

// Routes admin uniquement
router.post('/', auth, role('admin'), carRules, createCar);
router.put('/:id', auth, role('admin'), mongoIdParam, carUpdateRules, updateCar);
router.delete('/:id', auth, role('admin'), mongoIdParam, deleteCar);

module.exports = router;
