const mongoose = require('mongoose');
const Car = require('../models/Car');
const Review = require('../models/Review');
const CarComment = require('../models/CarComment');
const ApiError = require('../utils/ApiError');

const sanitizeComment = (value) => (typeof value === 'string' ? value.trim() : '');

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
    const hasCommentField = Object.prototype.hasOwnProperty.call(req.body, 'comment');
    const comment = sanitizeComment(req.body.comment);

    const carExists = await Car.exists({ _id: carId });
    if (!carExists) {
      throw ApiError.notFound('Voiture introuvable');
    }

    let review;

    try {
      review = await Review.findOneAndUpdate(
        { car: carId, user: userId },
        { $set: hasCommentField ? { rating, comment } : { rating } },
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
        { $set: hasCommentField ? { rating, comment } : { rating } },
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

const getCarReviews = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const carExists = await Car.exists({ _id: carId });
    if (!carExists) {
      throw ApiError.notFound('Voiture introuvable');
    }

    const [reviews, total] = await Promise.all([
      Review.find({ car: carId })
        .sort('-updatedAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'name')
        .lean(),
      Review.countDocuments({ car: carId })
    ]);

    const mappedReviews = reviews.map((review) => ({
      _id: String(review._id),
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        _id: review.user?._id ? String(review.user._id) : '',
        name: review.user?.name || 'User'
      },
      isMine: req.user?._id ? String(review.user?._id) === String(req.user._id) : false
    }));

    const myReview = mappedReviews.find((item) => item.isMine) || null;

    res.status(200).json({
      success: true,
      data: {
        reviews: mappedReviews,
        myReview,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyReview = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({ car: carId, user: userId });
    if (!review) {
      throw ApiError.notFound('Aucun avis à supprimer pour cette voiture');
    }

    const ratings = await recalculateCarRatings(carId);

    res.status(200).json({
      success: true,
      message: 'Avis supprimé avec succès',
      data: {
        ratings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCarComments = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 6)));
    const skip = (page - 1) * limit;
    const mine = req.query.mine === 'true';
    const sort = req.query.sort === 'oldest' ? 'oldest' : 'newest';
    const search = sanitizeComment(req.query.search).slice(0, 80);

    const carExists = await Car.exists({ _id: carId });
    if (!carExists) {
      throw ApiError.notFound('Voiture introuvable');
    }

    const filter = { car: carId };

    if (mine) {
      if (!req.user?._id) {
        return res.status(200).json({
          success: true,
          data: {
            comments: [],
            pagination: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false }
          }
        });
      }
      filter.user = req.user._id;
    }

    if (search) {
      filter.comment = { $regex: search, $options: 'i' };
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [comments, total] = await Promise.all([
      CarComment.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name')
        .lean(),
      CarComment.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit) || 0;

    res.status(200).json({
      success: true,
      data: {
        comments: comments.map((item) => ({
          _id: String(item._id),
          comment: item.comment,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          user: {
            _id: item.user?._id ? String(item.user._id) : '',
            name: item.user?.name || 'User'
          },
          isMine: req.user?._id ? String(item.user?._id) === String(req.user._id) : false
        })),
        pagination: {
          total,
          page,
          limit,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const userId = req.user._id;
    const comment = sanitizeComment(req.body.comment);

    const carExists = await Car.exists({ _id: carId });
    if (!carExists) {
      throw ApiError.notFound('Voiture introuvable');
    }

    const created = await CarComment.create({
      car: carId,
      user: userId,
      comment
    });

    const populated = await CarComment.findById(created._id)
      .populate('user', 'name')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Commentaire publié avec succès',
      data: {
        comment: {
          _id: String(populated._id),
          comment: populated.comment,
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
          user: {
            _id: populated.user?._id ? String(populated.user._id) : '',
            name: populated.user?.name || 'User'
          },
          isMine: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await CarComment.findOne({ _id: commentId, car: carId });
    if (!comment) {
      throw ApiError.notFound('Commentaire introuvable');
    }

    const isOwner = String(comment.user) === String(userId);
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('Vous ne pouvez supprimer que vos propres commentaires');
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rateCar,
  getCarReviews,
  getCarComments,
  createComment,
  deleteComment,
  deleteMyReview,
  recalculateCarRatings
};
