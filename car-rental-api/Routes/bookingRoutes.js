import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, role } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createBookingValidation } from '../validators/bookingValidator.js';
import { mongoIdParam } from '../validators/commonValidator.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  createBookingValidation,
  validate,
  createBooking
);

router.get('/my', getMyBookings);

router.get('/admin/all', role('admin'), getAllBookings);

router.get('/:id', mongoIdParam, validate, getBookingById);

router.put('/:id/cancel', mongoIdParam, validate, cancelBooking);

export default router;
