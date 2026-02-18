// controllers/bookingController.js
// Gère la création, consultation et annulation des réservations.
// Calcule automatiquement le prix total basé sur la durée et le prix par jour.

const Booking = require('../models/Booking');
const Car = require('../models/Car');
const ApiError = require('../utils/ApiError');

// ========================
// CRÉER UNE RÉSERVATION
// ========================
// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { carId, dateDebut, dateFin } = req.body;
    const userId = req.user.id;

    // 1. Vérifier que la voiture existe
    const car = await Car.findById(carId);
    if (!car) {
      throw ApiError.notFound('Voiture introuvable');
    }

    // 2. Vérifier que la voiture est disponible (flag)
    if (!car.disponible) {
      throw ApiError.conflict('Cette voiture n\'est pas disponible à la location');
    }

    // 3. Vérifier les conflits de dates avec d'autres réservations
    const isAvailable = await Booking.isCarAvailable(carId, dateDebut, dateFin);
    if (!isAvailable) {
      throw ApiError.conflict('Cette voiture est déjà réservée pour les dates sélectionnées');
    }

    // 4. Calculer le prix total
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const nombreJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const prixTotal = Number((nombreJours * car.prixParJour).toFixed(2));

    // 5. Créer la réservation
    const booking = await Booking.create({
      userId,
      carId,
      dateDebut: debut,
      dateFin: fin,
      prixTotal,
      statut: 'en_attente'
    });

    // 6. Peupler les références pour la réponse
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('carId', 'marque modele prixParJour image')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        booking: populatedBooking,
        resume: {
          voiture: `${car.marque} ${car.modele}`,
          duree: `${nombreJours} jour(s)`,
          prixParJour: `${car.prixParJour} €`,
          prixTotal: `${prixTotal} €`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// MES RÉSERVATIONS
// ========================
// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const { statut, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Filtre de base : réservations de l'utilisateur connecté
    const filter = { userId: req.user.id };

    // Filtre optionnel par statut
    if (statut) {
      const validStatuts = ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'];
      if (!validStatuts.includes(statut)) {
        throw ApiError.badRequest(
          `Statut invalide. Valeurs acceptées : ${validStatuts.join(', ')}`
        );
      }
      filter.statut = statut;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('carId', 'marque modele prixParJour image disponible')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// OBTENIR UNE RÉSERVATION PAR ID
// ========================
// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('carId', 'marque modele prixParJour image')
      .lean();

    if (!booking) {
      throw ApiError.notFound('Réservation introuvable');
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw ApiError.forbidden('Vous ne pouvez consulter que vos propres réservations');
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// ANNULER UNE RÉSERVATION
// ========================
// DELETE /api/bookings/:id
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw ApiError.notFound('Réservation introuvable');
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw ApiError.forbidden('Vous ne pouvez annuler que vos propres réservations');
    }

    // Vérifier que la réservation peut être annulée
    const nonCancellable = ['terminee', 'annulee'];
    if (nonCancellable.includes(booking.statut)) {
      throw ApiError.conflict(
        `Impossible d'annuler une réservation avec le statut "${booking.statut}"`
      );
    }

    // Vérifier si la réservation est déjà en cours
    if (booking.statut === 'en_cours') {
      throw ApiError.conflict(
        'Impossible d\'annuler une réservation en cours. Contactez le support.'
      );
    }

    // Annuler la réservation
    booking.statut = 'annulee';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('carId', 'marque modele')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// TOUTES LES RÉSERVATIONS (ADMIN)
// ========================
// GET /api/bookings/all
const getAllBookings = async (req, res, next) => {
  try {
    const { statut, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (statut) filter.statut = statut;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email')
        .populate('carId', 'marque modele prixParJour')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
};