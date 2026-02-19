// models/User.js
// Modèle utilisateur avec hashage automatique du mot de passe,
// méthode de comparaison de mot de passe et génération de JWT.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },

    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir un email valide'
      ]
    },

    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false // Ne jamais retourner le mot de passe dans les requêtes
    },role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Le rôle doit être "user" ou "admin"'
      },
      default: 'user'
    }
  },
  {
    timestamps: true, // createdAt et updatedAt automatiques
    toJSON: {
      // Transformer la sortie JSON pour retirer le mot de passe
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// ========================
// HOOKS (Middleware Mongoose)
// ========================

// Hasher le mot de passe avant chaque sauvegarde
userSchema.pre('save', async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ========================
// MÉTHODES D'INSTANCE
// ========================

// Comparer un mot de passe en clair avec le hash stocké
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Générer un token JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Index pour optimiser les recherches par email
// userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;