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

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

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
