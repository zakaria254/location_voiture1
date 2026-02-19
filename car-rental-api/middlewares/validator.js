// middlewares/validator.js
// Règles de validation avec express-validator pour chaque type de requête.
// Chaque export est un tableau de middlewares de validation.

const { body, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const MINIMUM_DRIVER_AGE = 21;

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

  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('Le champ images doit etre un tableau de 10 elements max'),

  body('images.*')
    .optional()
    .custom((value) => {
      const rawValue = typeof value === 'string' ? value.trim() : '';
      const isUrl = /^https?:\/\/\S+$/i.test(rawValue);
      const isBase64Image = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(rawValue);

      if (!isUrl && !isBase64Image) {
        throw new Error("Chaque image doit etre une URL valide ou une image uploadee");
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

  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('Le champ images doit etre un tableau de 10 elements max'),

  body('images.*')
    .optional()
    .custom((value) => {
      const rawValue = typeof value === 'string' ? value.trim() : '';
      const isUrl = /^https?:\/\/\S+$/i.test(rawValue);
      const isBase64Image = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(rawValue);

      if (!isUrl && !isBase64Image) {
        throw new Error("Chaque image doit etre une URL valide ou une image uploadee");
      }

      return true;
    }),

  validate
];

const ratingRules = [
  body('rating')
    .notEmpty().withMessage('La note est obligatoire')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5'),

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

  body('fullName')
    .trim()
    .notEmpty().withMessage('Le nom complet est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom complet doit contenir entre 2 et 100 caractères'),

  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Le numéro de téléphone est obligatoire')
    .matches(/^[+0-9()\s-]{8,20}$/).withMessage('Le numéro de téléphone est invalide'),

  body('driverLicenseNumber')
    .trim()
    .notEmpty().withMessage('Le numéro de permis est obligatoire')
    .isLength({ min: 5, max: 40 }).withMessage('Le numéro de permis doit contenir entre 5 et 40 caractères'),

  body('driverLicenseExpiry')
    .notEmpty().withMessage("La date d'expiration du permis est obligatoire")
    .isISO8601().withMessage("La date d'expiration du permis doit être au format ISO 8601 (YYYY-MM-DD)")
    .custom((value, { req }) => {
      const expiry = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateFin = new Date(req.body.dateFin);

      if (expiry <= today) {
        throw new Error("Le permis de conduire est expiré");
      }

      if (expiry <= dateFin) {
        throw new Error("Le permis doit être valide pendant toute la durée de location");
      }

      return true;
    }),

  body('dateOfBirth')
    .notEmpty().withMessage('La date de naissance est obligatoire')
    .isISO8601().withMessage('La date de naissance doit être au format ISO 8601 (YYYY-MM-DD)')
    .custom((value) => {
      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < MINIMUM_DRIVER_AGE) {
        throw new Error(`Age minimum requis: ${MINIMUM_DRIVER_AGE} ans`);
      }

      return true;
    }),

  body('acceptTerms')
    .custom((value) => value === true)
    .withMessage("Vous devez accepter les conditions de location"),

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

const mongoCarIdParam = [
  param('carId')
    .isMongoId().withMessage('Identifiant voiture invalide'),

  validate
];

module.exports = {
  registerRules,
  loginRules,
  carRules,
  carUpdateRules,
  ratingRules,
  bookingRules,
  bookingStatusUpdateRules,
  mongoIdParam,
  mongoCarIdParam,
  validate
};
