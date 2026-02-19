// routes/bookingRoutes.js
// Routes pour les réservations.
// Toutes les routes nécessitent une authentification.

const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { bookingRules, bookingStatusUpdateRules, mongoIdParam } = require('../middlewares/validator');

// Toutes les routes sont protégées
router.use(auth);

// Routes utilisateur
router.post('/', bookingRules, createBooking);
router.get('/my', getMyBookings);
router.get('/:id', mongoIdParam, getBookingById);
router.delete('/:id', mongoIdParam, cancelBooking);

// Routes admin
router.get('/admin/all', role('admin'), getAllBookings);
router.patch('/:id/status', role('admin'), mongoIdParam, bookingStatusUpdateRules, updateBookingStatus);
// export router 
module.exports = router;
