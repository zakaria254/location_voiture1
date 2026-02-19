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
const { rateCar } = require('../controllers/reviewController');

const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const role = require('../middlewares/role');
const {
  carRules,
  carUpdateRules,
  ratingRules,
  mongoIdParam
} = require('../middlewares/validator');

// Routes publiques
router.get('/', optionalAuth, getAllCars);
router.get('/reserved-ids', getReservedCarIds);
router.get('/:id', optionalAuth, mongoIdParam, getCarById);
router.put('/:id/rating', auth, mongoIdParam, ratingRules, rateCar);

// Routes admin uniquement
router.get('/admin/archives/deleted', auth, role('admin'), getDeletedCarsArchive);
router.post('/', auth, role('admin'), carRules, createCar);
router.put('/:id', auth, role('admin'), mongoIdParam, carUpdateRules, updateCar);
router.delete('/:id', auth, role('admin'), mongoIdParam, deleteCar);

module.exports = router;
