// controllers/authController.js
// Gère l'inscription et la connexion des utilisateurs.
// Retourne un JWT après authentification réussie.

const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// ========================
// INSCRIPTION
// ========================
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('Un compte avec cet email existe déjà');
    }

    // 2. Créer l'utilisateur (le mot de passe est hashé automatiquement via le hook pre-save)
    const user = await User.create({
      name,
      email,
      password,
      // Seul un admin peut créer un autre admin (sécurité)
      role: role === 'admin' && req.user?.role === 'admin' ? 'admin' : 'user'
    });

    // 3. Générer le token JWT
    const token = user.generateAuthToken();

    // 4. Répondre
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// CONNEXION
// ========================
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Chercher l'utilisateur avec le mot de passe (select: false par défaut)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // 3. Générer le token
    const token = user.generateAuthToken();

    // 4. Répondre
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PROFIL UTILISATEUR CONNECTÉ
// ========================
// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw ApiError.notFound('Utilisateur introuvable');
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
