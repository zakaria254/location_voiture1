// routes/bookingRoutes.js
// Routes pour les réservations.
// Toutes les routes nécessitent une authentification.

const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  getActiveBookingByCar,
  cancelBooking,
  deleteBookingPermanently,
  getAllBookings,
  getDeletedBookingsArchive,
  updateBookingStatus
} = require('../controllers/bookingController');

const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { bookingRules, bookingStatusUpdateRules, mongoIdParam, mongoCarIdParam } = require('../middlewares/validator');

// Toutes les routes sont protégées
router.use(auth);

// Routes utilisateur
router.post('/', bookingRules, createBooking);
router.get('/my', getMyBookings);
router.get('/car/:carId/active', role('admin'), mongoCarIdParam, getActiveBookingByCar);
router.get('/admin/archives/deleted', role('admin'), getDeletedBookingsArchive);
router.get('/:id', mongoIdParam, getBookingById);
router.delete('/:id', mongoIdParam, cancelBooking);
router.delete('/:id/permanent', mongoIdParam, deleteBookingPermanently);

// Routes admin
router.get('/admin/all', role('admin'), getAllBookings);
router.patch('/:id/status', role('admin'), mongoIdParam, bookingStatusUpdateRules, updateBookingStatus);
// export router 
module.exports = router;
