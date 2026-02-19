// server.js
// Point d'entrée principal de l'application.
// Configure Express, connecte MongoDB, monte les routes et lance le serveur.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Charger les variables d'environnement AVANT tout import de config
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialisation Express
const app = express();

// ========================
// MIDDLEWARES GLOBAUX
// ========================

// Sécurité : headers HTTP
app.use(helmet());

// CORS : autoriser les requêtes cross-origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger HTTP (désactivé en test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parser le JSON dans le body des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const globalLimiterMax = Number(process.env.RATE_LIMIT_MAX || (isDev ? 1000 : 100));
const authLimiterMax = Number(process.env.AUTH_RATE_LIMIT_MAX || (isDev ? 200 : 20));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: globalLimiterMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes globales. Réessayez dans 15 minutes.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: authLimiterMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives d’authentification. Réessayez dans 15 minutes.'
  }
});

app.use('/api/', globalLimiter);

// ========================
// ROUTES
// ========================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚗 API Car Rental - Bienvenue',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      cars: '/api/cars',
      bookings: '/api/bookings'
    }
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

// Route 404 pour les endpoints inexistants
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} introuvable`
  });
});

// ========================
// GESTION D'ERREURS GLOBALE
// ========================
app.use(errorHandler);

// ========================
// DÉMARRAGE DU SERVEUR
// ========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error.message);
    process.exit(1);
  }
};

startServer();

// Gestion propre de l'arrêt du serveur
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt propre du serveur...');
  process.exit(0);
});

module.exports = app;
