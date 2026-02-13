// models/Car.js
// Modèle voiture avec validation des champs, valeurs par défaut
// et index pour optimiser les recherches de voitures disponibles.

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    marque: {
      type: String,
      required: [true, 'La marque est obligatoire'],
      trim: true,
      maxlength: [50, 'La marque ne peut pas dépasser 50 caractères']
    },

    modele: {
      type: String,
      required: [true, 'Le modèle est obligatoire'],
      trim: true,
      maxlength: [50, 'Le modèle ne peut pas dépasser 50 caractères']
    },

    prixParJour: {
      type: Number,
      required: [true, 'Le prix par jour est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif'],
      validate: {
        validator: function (value) {
          // Accepter max 2 décimales
          return Number(value.toFixed(2)) === value;
        },
        message: 'Le prix ne peut avoir que 2 décimales maximum'
      }
    },

    disponible: {
      type: Boolean,
      default: true
    },

    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Voiture',
      trim: true
    },

    // Champs supplémentaires utiles
    annee: {
      type: Number,
      min: [1900, "L'année doit être supérieure à 1900"],
      max: [new Date().getFullYear() + 1, 'Année invalide']
    },

    description: {
      type: String,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);
// Index composé pour rechercher les voitures disponibles par marque
carSchema.index({ disponible: 1, marque: 1 });
carSchema.index({ prixParJour: 1 });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;