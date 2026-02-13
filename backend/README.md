# 🚗 Backend - Application de Location de Voitures

Un backend professionnel et complet pour une application de location de voitures, construit avec Node.js, Express et MongoDB (Mongoose).

## 📁 Structure du Projet

```
backend/
├── config/
│   └── database.js          # Connexion à MongoDB
├── controllers/
│   ├── authController.js    # Logique d'authentification
│   ├── carController.js     # Logique des voitures
│   └── bookingController.js # Logique des réservations
├── middlewares/
│   ├── auth.js              # Middleware d'authentification JWT
│   ├── role.js              # Middleware de vérification de rôle
│   ├── validator.js         # Middleware de validation express-validator
│   └── errorHandler.js      # Middleware de gestion des erreurs
├── models/
│   ├── User.js              # Modèle Utilisateur
│   ├── Car.js               # Modèle Voiture
│   └── Booking.js           # Modèle Réservation
├── routes/
│   ├── authRoutes.js        # Routes d'authentification
│   ├── carRoutes.js         # Routes des voitures
│   └── bookingRoutes.js     # Routes des réservations
├── .env                     # Variables d'environnement
├── package.json             # Dépendances du projet
└── server.js                # Point d'entrée du serveur
```

## 🛠️ Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou MongoDB Atlas)

### Étapes d'installation

1. **Naviguer vers le dossier backend :**
   ```bash
   cd backend
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**
   
   Modifier le fichier `.env` avec vos valeurs :
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/car-rental
   JWT_SECRET=votre_secret_jwt_super_securise
   ```

4. **Démarrer le serveur :**
   
   - Mode développement (avec restart automatique) :
     ```bash
     npm run dev
     ```
   
   - Mode production :
     ```bash
     npm start
     ```

## 📡 API Endpoints

### 🔐 Authentification

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| POST | `/api/auth/register` | Inscription utilisateur | Public |
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/me` | Obtenir le profil | Private |

### 🚗 Voitures

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| GET | `/api/cars` | Liste des voitures (avec filtres) | Public |
| GET | `/api/cars/:id` | Détails d'une voiture | Public |
| POST | `/api/cars` | Créer une voiture | Admin |
| PUT | `/api/cars/:id` | Modifier une voiture | Admin |
| DELETE | `/api/cars/:id` | Supprimer une voiture | Admin |

### 📅 Réservations

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| POST | `/api/bookings` | Créer une réservation | Private |
| GET | `/api/bookings/my` | Mes réservations | Private |
| GET | `/api/bookings` | Toutes les réservations | Admin |
| DELETE | `/api/bookings/:id` | Annuler une réservation | Private |
| PUT | `/api/bookings/:id/status` | Modifier le statut | Admin |

## 🔒 Authentification

L'API utilise des tokens JWT pour l'authentification. Pour accéder aux routes privées :

1. **Inscription/Connexion** pour obtenir un token
2. **Inclure le token** dans les headers :
   ```
   Authorization: Bearer <votre_token_jwt>
   ```

## 📝 Exemples de Requêtes

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Créer une voiture (Admin)
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{"marque": "Toyota", "modele": "Camry", "prixParJour": 50, "categorie": "sedan"}'
```

### Réserver une voiture
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"carId": "<car_id>", "dateDebut": "2024-12-01", "dateFin": "2024-12-05"}'
```

## ✅ Validation

Le backend valide les données entrantes :

- **Email** : Format valide
- **Mot de passe** : Minimum 6 caractères
- **Voiture** : Marque, modèle et prix obligatoires
- **Dates** : Date de fin > date de début, date de début dans le futur

## 🔧 Technologies Utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification par tokens
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données
- **cors** - Gestion CORS
- **dotenv** - Variables d'environnement

## 📄 Licence

ISC
