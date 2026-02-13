import express from 'express';
import {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import { protect, role } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  createCarValidation,
  updateCarValidation
} from '../validators/carValidator.js';
import { mongoIdParam } from '../validators/commonValidator.js';

const router = express.Router();

router.get('/', getAllCars);
router.get('/:id', mongoIdParam, validate, getCarById);

router.use(protect);

router.post(
  '/',
  role('admin'),
  createCarValidation,
  validate,
  createCar
);

router.put(
  '/:id',
  role('admin'),
  mongoIdParam,
  updateCarValidation,
  validate,
  updateCar
);

router.delete(
  '/:id',
  role('admin'),
  mongoIdParam,
  validate,
  deleteCar
);

export default router;
