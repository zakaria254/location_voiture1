import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  registerValidation,
  loginValidation
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
