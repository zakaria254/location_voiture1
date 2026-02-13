// middlewares/errorHandler.js
// Gestionnaire d'erreurs global Express.
// Capture toutes les erreurs, les formate et renvoie une réponse JSON cohérente.

const errorHandler = (err, req, res, next) => {
  // Log de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('\n🔴 ERREUR:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('');
  }

  // Objet de réponse par défaut
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = err.errors || [];

  // ========================
  // ERREURS MONGOOSE SPÉCIFIQUES
  // ========================

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Erreurs de validation';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // Erreur de clé dupliquée (email unique par exemple)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `La valeur "${value}" existe déjà pour le champ "${field}"`;
    errors = [{ field, message, value }];
  }

  // Erreur de cast (ID MongoDB invalide)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Valeur invalide pour ${err.path}: ${err.value}`;
    errors = [{ field: err.path, message, value: err.value }];
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }

  // ========================
  // RÉPONSE
  // ========================

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;