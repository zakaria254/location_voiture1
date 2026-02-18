// config/db.js
// Gère la connexion à MongoDB via Mongoose.
// Affiche les événements de connexion/déconnexion dans la console.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options Mongoose recommandées pour la production
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📦 Base de données: ${conn.connection.name}`);

    // Événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 