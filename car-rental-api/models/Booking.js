// models/Booking.js
// Modèle de réservation avec références vers User et Car,
// calcul automatique du prix total et validation des dates.

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'identifiant utilisateur est obligatoire"]
    },

    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, "L'identifiant de la voiture est obligatoire"]
    },

    dateDebut: {
      type: Date,
      required: [true, 'La date de début est obligatoire'],
      validate: {
        validator: function (value) {
          // La date de début doit être aujourd'hui ou dans le futur
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: 'La date de début doit être dans le futur'
      }
    },

    dateFin: {
      type: Date,
      required: [true, 'La date de fin est obligatoire'],
      validate: {
        validator: function (value) {
          // La date de fin doit être après la date de début
          return value > this.dateDebut;
        },
        message: 'La date de fin doit être postérieure à la date de début'
      }
    },

    fullName: {
      type: String,
      required: [true, 'Le nom complet est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom complet doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom complet ne peut pas dépasser 100 caractères']
    },

    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire'],
      trim: true
    },

    driverLicenseNumber: {
      type: String,
      required: [true, 'Le numéro de permis est obligatoire'],
      trim: true
    },

    driverLicenseExpiry: {
      type: Date,
      required: [true, "La date d'expiration du permis est obligatoire"]
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'La date de naissance est obligatoire']
    },

    acceptTerms: {
      type: Boolean,
      required: [true, 'Vous devez accepter les conditions de location'],
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: 'Vous devez accepter les conditions de location'
      }
    },

    statut: {
      type: String,
      enum: {
        values: ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'],
        message: 'Statut invalide'
      },
      default: 'en_attente'
    },

    prixTotal: {
      type: Number,
      min: [0, 'Le prix total ne peut pas être négatif']
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

// Index pour optimiser les requêtes fréquentes
bookingSchema.index({ userId: 1, statut: 1 });
bookingSchema.index({ carId: 1, dateDebut: 1, dateFin: 1 });
bookingSchema.index({ statut: 1 });
bookingSchema.index({ email: 1 });

// ========================
// MÉTHODES STATIQUES
// ========================

// Vérifier si une voiture est disponible pour une période donnée
bookingSchema.statics.isCarAvailable = async function (carId, dateDebut, dateFin, excludeBookingId = null) {
  const query = {
    carId,
    statut: { $nin: ['annulee', 'terminee'] },
    $or: [
      {
        dateDebut: { $lte: new Date(dateFin) },
        dateFin: { $gte: new Date(dateDebut) }
      }
    ]
  };

  // Exclure une réservation spécifique (utile pour les mises à jour)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return !conflictingBooking;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
