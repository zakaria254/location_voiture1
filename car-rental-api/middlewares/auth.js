// middlewares/auth.js
// Middleware d'authentification JWT.
// Vérifie le token dans le header Authorization et attache l'utilisateur à req.user.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    // 1. Extraire le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Accès refusé. Token manquant ou mal formaté.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Accès refusé. Aucun token fourni.');
    }

    // 2. Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expiré. Veuillez vous reconnecter.');
      }
      if (jwtError.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Token invalide.');
      }
      throw ApiError.unauthorized('Erreur d\'authentification.');
    }

    // 3. Vérifier que l'utilisateur existe toujours en base
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw ApiError.unauthorized('Utilisateur introuvable. Compte supprimé.');
    }

    // 4. Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;