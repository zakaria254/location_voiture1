// controllers/carController.js
// CRUD complet pour les voitures.
// Les opérations de création, modification et suppression sont réservées aux admins.

const Car = require('../models/Car');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

// ========================
// LISTER TOUTES LES VOITURES
// ========================
// GET /api/cars
// Supporte la pagination, le tri et le filtrage
const getAllCars = async (req, res, next) => {
  try {
    // Paramètres de requête
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      marque,
      disponible,
      prixMin,
      prixMax,
      search
    } = req.query;

    // Construction du filtre
    const filter = {};

    if (marque) {
      filter.marque = { $regex: marque, $options: 'i' };
    }

    if (disponible !== undefined) {
      filter.disponible = disponible === 'true';
    }

    if (prixMin || prixMax) {
      filter.prixParJour = {};
      if (prixMin) filter.prixParJour.$gte = Number(prixMin);
      if (prixMax) filter.prixParJour.$lte = Number(prixMax);
    }

    if (search) {
      filter.$or = [
        { marque: { $regex: search, $options: 'i' } },
        { modele: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Exécution de la requête
    const [cars, total] = await Promise.all([
      Car.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Car.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        cars,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// OBTENIR UNE VOITURE PAR ID
// ========================
// GET /api/cars/:id
const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).lean();

    if (!car) {
      throw ApiError.notFound('Voiture introuvable');
    }

    res.status(200).json({
      success: true,
      data: { car }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// CRÉER UNE VOITURE (ADMIN)
// ========================
// POST /api/cars
const createCar = async (req, res, next) => {
  try {
    const { marque, modele, prixParJour, disponible, image, annee, description } = req.body;

    const car = await Car.create({
      marque,
      modele,
      prixParJour,
      disponible,
      image,
      annee,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Voiture créée avec succès',
      data: { car }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// METTRE À JOUR UNE VOITURE (ADMIN)
// ========================
// PUT /api/cars/:id
const updateCar = async (req, res, next) => {
  try {
    // Champs autorisés à la mise à jour
    const allowedFields = ['marque', 'modele', 'prixParJour', 'disponible', 'image', 'annee', 'description'];
    const updates = {};

    // Ne garder que les champs autorisés et présents dans le body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest('Aucun champ à mettre à jour');
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,          // Retourner le document mis à jour
        runValidators: true  // Appliquer les validations Mongoose
      }
    );

    if (!car) {
      throw ApiError.notFound('Voiture introuvable');
    }

    res.status(200).json({
      success: true,
      message: 'Voiture mise à jour avec succès',
      data: { car }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// SUPPRIMER UNE VOITURE (ADMIN)
// ========================
// DELETE /api/cars/:id
const deleteCar = async (req, res, next) => {
  try {
    // Vérifier s'il y a des réservations actives pour cette voiture
    const activeBookings = await Booking.countDocuments({
      carId: req.params.id,
      statut: { $in: ['en_attente', 'confirmee', 'en_cours'] }
    });

    if (activeBookings > 0) {
      throw ApiError.conflict(
        `Impossible de supprimer cette voiture. ${activeBookings} réservation(s) active(s) en cours.`
      );
    }

    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      throw ApiError.notFound('Voiture introuvable');
    }

    res.status(200).json({
      success: true,
      message: 'Voiture supprimée avec succès',
      data: { car }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// OBTENIR LES IDs DES VOITURES RESERVEES
// ========================
// GET /api/cars/reserved-ids
const getReservedCarIds = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservedCarIds = await Booking.distinct('carId', {
      statut: { $in: ['en_attente', 'confirmee', 'en_cours'] },
      dateFin: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        reservedCarIds: reservedCarIds.map((id) => id.toString())
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCars,
  getReservedCarIds,
  getCarById,
  createCar,
  updateCar,
  deleteCar
};
