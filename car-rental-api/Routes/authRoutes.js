// routes/authRoutes.js
// Routes d'authentification : inscription, connexion, profil.

const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { registerRules, loginRules } = require('../middlewares/validator');

// Routes publiques
router.post('/register', registerRules, register);
router.post('/login', loginRules, login);

// Route protégée
router.get('/me', auth, getMe);

module.exports = router;