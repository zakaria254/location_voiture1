// controllers/carController.js
// CRUD complet pour les voitures.
// Les opérations de création, modification et suppression sont réservées aux admins.

const Car = require('../models/Car');
const Booking = require('../models/Booking');
const DeletedCar = require('../models/DeletedCar');
const ApiError = require('../utils/ApiError');

const normalizeCarImages = (car) => {
  const images = Array.isArray(car.images) && car.images.length
    ? car.images
    : (car.image ? [car.image] : []);
  return { ...car, images, image: car.image || images[0] || '' };
};

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

    const normalizedCars = cars.map(normalizeCarImages);

    res.status(200).json({
      success: true,
      data: {
        cars: normalizedCars,
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
      data: { car: normalizeCarImages(car) }
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
    const { marque, modele, prixParJour, disponible, image, images, annee, description } = req.body;

    const normalizedImages = Array.isArray(images)
      ? images.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const mainImage = typeof image === 'string' && image.trim()
      ? image.trim()
      : (normalizedImages[0] || undefined);

    const car = await Car.create({
      marque,
      modele,
      prixParJour,
      disponible,
      image: mainImage,
      images: normalizedImages.length ? normalizedImages : (mainImage ? [mainImage] : []),
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
    const allowedFields = ['marque', 'modele', 'prixParJour', 'disponible', 'image', 'images', 'annee', 'description'];
    const updates = {};

    // Ne garder que les champs autorisés et présents dans le body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.images !== undefined) {
      updates.images = Array.isArray(updates.images)
        ? updates.images.map((item) => String(item || '').trim()).filter(Boolean)
        : [];
      if (!updates.image && updates.images.length > 0) {
        updates.image = updates.images[0];
      }
      if (updates.images.length === 0 && updates.image === undefined) {
        updates.image = '';
      }
    } else if (typeof updates.image === 'string' && updates.image.trim()) {
      updates.image = updates.image.trim();
      updates.images = [updates.image];
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

    const car = await Car.findById(req.params.id);

    if (!car) {
      throw ApiError.notFound('Voiture introuvable');
    }

    await DeletedCar.create({
      originalCarId: car._id,
      deletedBy: { userId: req.user.id, role: req.user.role },
      car: car.toObject()
    });

    await car.deleteOne();

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

// ========================
// ARCHIVES DES VOITURES SUPPRIMEES (ADMIN)
// ========================
// GET /api/cars/admin/archives/deleted
const getDeletedCarsArchive = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      DeletedCar.find()
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DeletedCar.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        records,
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
  getAllCars,
  getReservedCarIds,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getDeletedCarsArchive
};
