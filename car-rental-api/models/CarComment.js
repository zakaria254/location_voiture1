const mongoose = require('mongoose');

const carCommentSchema = new mongoose.Schema(
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
    comment: {
      type: String,
      required: [true, 'Le commentaire est obligatoire'],
      trim: true,
      maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
    }
  },
  {
    timestamps: true
  }
);

carCommentSchema.index({ car: 1, createdAt: -1 });
carCommentSchema.index({ car: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model('CarComment', carCommentSchema);
