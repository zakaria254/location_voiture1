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