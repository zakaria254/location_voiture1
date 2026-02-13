// middlewares/role.js
// Middleware de vérification des rôles.
// Restreint l'accès à certaines routes selon le rôle de l'utilisateur.
// Doit être utilisé APRÈS le middleware auth.

const ApiError = require('../utils/ApiError');

const role = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        throw ApiError.unauthorized('Authentification requise.');
      }

      // Vérifier que le rôle de l'utilisateur est autorisé
      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden(
          `Accès interdit. Rôle requis : ${allowedRoles.join(' ou ')}. Votre rôle : ${req.user.role}.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = role;