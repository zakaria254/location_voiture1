// middlewares/validator.js
// Règles de validation avec express-validator pour chaque type de requête.
// Chaque export est un tableau de middlewares de validation.

const { body, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// ========================
// MIDDLEWARE DE RÉSULTAT
// ========================

// Vérifie les erreurs de validation et renvoie une réponse 400 si nécessaire
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    throw ApiError.badRequest('Erreurs de validation', formattedErrors);
  }

  next();
};

// ========================
// RÈGLES : AUTHENTIFICATION
// ========================

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),

  validate
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire'),

  validate
];

// ========================
// RÈGLES : VOITURES
// ========================

const carRules = [
  body('marque')
    .trim()
    .notEmpty().withMessage('La marque est obligatoire')
    .isLength({ max: 50 }).withMessage('La marque ne peut pas dépasser 50 caractères'),

  body('modele')
    .trim()
    .notEmpty().withMessage('Le modèle est obligatoire')
    .isLength({ max: 50 }).withMessage('Le modèle ne peut pas dépasser 50 caractères'),

  body('prixParJour')
    .notEmpty().withMessage('Le prix par jour est obligatoire')
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),

  body('disponible')
    .optional()
    .isBoolean().withMessage('Le champ disponible doit être un booléen'),

  body('image')
    .optional()
    .custom((value) => {
      const rawValue = typeof value === 'string' ? value.trim() : '';
      const isUrl = /^https?:\/\/\S+$/i.test(rawValue);
      const isBase64Image = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(rawValue);

      if (!isUrl && !isBase64Image) {
        throw new Error("L'image doit être une URL valide ou une image uploadée");
      }

      return true;
    }),

  body('annee')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`L'année doit être entre 1900 et ${new Date().getFullYear() + 1}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),

  validate
];

const carUpdateRules = [
  body('marque')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('La marque doit contenir entre 1 et 50 caractères'),

  body('modele')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Le modèle doit contenir entre 1 et 50 caractères'),

  body('prixParJour')
    .optional()
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),

  body('disponible')
    .optional()
    .isBoolean().withMessage('Le champ disponible doit être un booléen'),

  body('image')
    .optional()
    .custom((value) => {
      const rawValue = typeof value === 'string' ? value.trim() : '';
      const isUrl = /^https?:\/\/\S+$/i.test(rawValue);
      const isBase64Image = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(rawValue);

      if (!isUrl && !isBase64Image) {
        throw new Error("L'image doit être une URL valide ou une image uploadée");
      }

      return true;
    }),

  validate
];

// ========================
// RÈGLES : RÉSERVATIONS
// ========================

const bookingRules = [
  body('carId')
    .notEmpty().withMessage("L'identifiant de la voiture est obligatoire")
    .isMongoId().withMessage('Identifiant de voiture invalide'),

  body('dateDebut')
    .notEmpty().withMessage('La date de début est obligatoire')
    .isISO8601().withMessage('La date de début doit être au format ISO 8601 (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('La date de début ne peut pas être dans le passé');
      }
      return true;
    }),

  body('dateFin')
    .notEmpty().withMessage('La date de fin est obligatoire')
    .isISO8601().withMessage('La date de fin doit être au format ISO 8601 (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const dateFin = new Date(value);
      const dateDebut = new Date(req.body.dateDebut);
      if (dateFin <= dateDebut) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      // Limiter à 30 jours maximum
      const diffTime = Math.abs(dateFin - dateDebut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        throw new Error('La durée de location ne peut pas dépasser 30 jours');
      }
      return true;
    }),

  validate
];

const bookingStatusUpdateRules = [
  body('statut')
    .notEmpty().withMessage('Le statut est obligatoire')
    .isIn(['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'])
    .withMessage('Statut invalide. Valeurs acceptées: en_attente, confirmee, en_cours, terminee, annulee'),

  validate
];

// ========================
// RÈGLES : PARAMÈTRES
// ========================

const mongoIdParam = [
  param('id')
    .isMongoId().withMessage('Identifiant invalide'),

  validate
];

module.exports = {
  registerRules,
  loginRules,
  carRules,
  carUpdateRules,
  bookingRules,
  bookingStatusUpdateRules,
  mongoIdParam,
  validate
};
