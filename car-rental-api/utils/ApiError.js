// utils/ApiError.js
// Classe d'erreur personnalisée pour standardiser les réponses d'erreur.
// Permet de lancer des erreurs avec un code HTTP et un message propre.

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    // Capturer la stack trace sans inclure le constructeur
    Error.captureStackTrace(this, this.constructor);
  }

  // Méthodes statiques pour les erreurs courantes
  static badRequest(message = 'Requête invalide', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Non autorisé') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflit de données') {
    return new ApiError(409, message);
  }

  static internal(message = 'Erreur interne du serveur') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;