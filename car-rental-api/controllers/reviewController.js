const mongoose = require('mongoose');
const Car = require('../models/Car');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');

const recalculateCarRatings = async (carId) => {
  const [stats] = await Review.aggregate([
    {
      $match: { car: new mongoose.Types.ObjectId(carId) }
    },
    {
      $group: {
        _id: '$car',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
  const totalRatings = stats ? stats.totalRatings : 0;

  const car = await Car.findByIdAndUpdate(
    carId,
    { averageRating, totalRatings },
    { new: true, runValidators: true }
  );

  if (!car) {
    throw ApiError.notFound('Voiture introuvable');
  }

  return { averageRating, totalRatings };
};

const rateCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const userId = req.user._id;
    const rating = Number(req.body.rating);

    const carExists = await Car.exists({ _id: carId });
    if (!carExists) {
      throw ApiError.notFound('Voiture introuvable');
    }

    let review;

    try {
      review = await Review.findOneAndUpdate(
        { car: carId, user: userId },
        { $set: { rating } },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      review = await Review.findOneAndUpdate(
        { car: carId, user: userId },
        { $set: { rating } },
        { new: true, runValidators: true }
      );
    }

    const ratings = await recalculateCarRatings(carId);

    res.status(200).json({
      success: true,
      message: 'Note enregistrée avec succès',
      data: {
        review,
        ratings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rateCar,
  recalculateCarRatings
};
