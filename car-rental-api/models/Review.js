const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'La voiture est obligatoire']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est obligatoire"]
    },
    rating: {
      type: Number,
      required: [true, 'La note est obligatoire'],
      min: [1, 'La note minimum est 1'],
      max: [5, 'La note maximum est 5']
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ car: 1, user: 1 }, { unique: true });
reviewSchema.index({ car: 1 });

module.exports = mongoose.model('Review', reviewSchema);
