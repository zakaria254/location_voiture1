# 🚗 API de Location de Voitures

API REST professionnelle pour la gestion d'un système de location de voitures, développée avec Node.js, Express et MongoDB.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Structure du Projet](#-structure-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Documentation API](#-documentation-api)
- [Tests avec cURL](#-tests-avec-curl)
- [Sécurité](#-sécurité)
- [Contribution](#-contribution)

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription utilisateur avec validation
- ✅ Connexion avec JWT
- ✅ Hashage sécurisé des mots de passe (bcrypt)
- ✅ Gestion des rôles (user, admin)
- ✅ Protection des routes par authentification

### Gestion des Voitures
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Pagination et tri
- ✅ Filtres avancés (marque, prix, disponibilité)
- ✅ Recherche par mot-clé
- ✅ Protection admin pour création/modification/suppression

### Gestion des Réservations
- ✅ Création de réservation avec validation des dates
- ✅ Calcul automatique du prix total
- ✅ Vérification de disponibilité (pas de double réservation)
- ✅ Consultation de mes réservations
- ✅ Annulation de réservation
- ✅ Vue admin de toutes les réservations

### Sécurité
- ✅ Headers sécurisés (Helmet)
- ✅ Rate limiting (protection brute force)
- ✅ CORS configuré
- ✅ Validation des données (express-validator)
- ✅ Gestion centralisée des erreurs

## 🛠 Technologies

- **Node.js** (v14+)
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par token
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données
- **helmet** - Sécurité HTTP
- **cors** - Gestion des requêtes cross-origin
- **morgan** - Logger HTTP
- **express-rate-limit** - Protection contre les attaques
- **dotenv** - Variables d'environnement

## 📁 Structure du Projet

```
car-rental-api/
├── config/
│   └── db.js                    # Configuration MongoDB
├── models/
│   ├── User.js                  # Modèle utilisateur
│   ├── Car.js                   # Modèle voiture
│   └── Booking.js               # Modèle réservation
├── controllers/
│   ├── authController.js        # Logique authentification
│   ├── carController.js         # Logique CRUD voitures
│   └── bookingController.js     # Logique réservations
├── routes/
│   ├── authRoutes.js            # Routes auth
│   ├── carRoutes.js             # Routes voitures
│   └── bookingRoutes.js         # Routes réservations
├── middlewares/
│   ├── auth.js                  # Middleware JWT
│   ├── role.js                  # Middleware rôles
│   ├── validator.js             # Validations
│   └── errorHandler.js          # Gestion erreurs
├── utils/
│   └── ApiError.js              # Classe erreur personnalisée
├── .env                         # Variables d'environnement
├── .gitignore
├── package.json
├── README.md
└── server.js                    # Point d'entrée
```

## 📦 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd car-rental-api
```

2. **Installer les dépendances**
```bash
npm install
```

Les dépendances suivantes seront installées :

**Production :**
- express (^4.21.0)
- mongoose (^8.7.0)
- dotenv (^16.4.5)
- bcryptjs (^2.4.3)
- jsonwebtoken (^9.0.2)
- cors (^2.8.5)
- helmet (^7.1.0)
- morgan (^1.10.0)
- express-validator (^7.2.0)
- express-rate-limit (^7.4.0)

**Développement :**
- nodemon (^3.1.7)

3. **Démarrer MongoDB**

Sur Linux/Mac :
```bash
mongod
```

Sur Windows :
```bash
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
```

Ou avec Docker :
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB
MONGO_URI=mongodb://localhost:27017/car_rental_db

# JWT Secret (à changer en production !)
JWT_SECRET=votre_super_secret_jwt_change_moi_en_production_2024
JWT_EXPIRE=7d

# CORS (optionnel)
CLIENT_URL=http://localhost:3000
```

### ⚠️ Important pour la Production

1. **Changer JWT_SECRET** : Utiliser une clé aléatoire forte
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Configurer MONGO_URI** : Utiliser MongoDB Atlas ou un serveur distant
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental_db
```

3. **NODE_ENV** : Définir à `production`

## 🚀 Démarrage

### Mode Développement (avec rechargement auto)
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

Le serveur démarre sur : `http://localhost:5000`

### Vérifier que le serveur fonctionne
```bash
curl http://localhost:5000
```

Réponse attendue :
```json
{
  "success": true,
  "message": "🚗 API Car Rental - Bienvenue",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "cars": "/api/cars",
    "bookings": "/api/bookings"
  }
}
```

## 📚 Documentation API

### Base URL
```
http://localhost:5000/api
```

### Authentification

#### 📝 Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@email.com",
  "password": "MonPass1"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "...",
      "name": "Jean Dupont",
      "email": "jean@email.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 🔐 Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean@email.com",
  "password": "MonPass1"
}
```

#### 👤 Mon Profil
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Voitures

#### 📋 Liste des voitures
```http
GET /api/cars
GET /api/cars?page=1&limit=10
GET /api/cars?disponible=true&prixMax=50&search=renault
```

**Paramètres de requête :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de résultats par page (défaut: 10, max: 50)
- `sort` : Tri (ex: `prixParJour`, `-createdAt`)
- `marque` : Filtrer par marque
- `disponible` : `true` ou `false`
- `prixMin` : Prix minimum
- `prixMax` : Prix maximum
- `search` : Recherche dans marque et modèle

#### 🚗 Détails d'une voiture
```http
GET /api/cars/:id
```

#### ➕ Créer une voiture (Admin uniquement)
```http
POST /api/cars
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "marque": "Renault",
  "modele": "Clio V",
  "prixParJour": 45.99,
  "image": "https://example.com/clio.jpg",
  "annee": 2023,
  "description": "Citadine économique"
}
```

#### ✏️ Modifier une voiture (Admin uniquement)
```http
PUT /api/cars/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "prixParJour": 39.99,
  "disponible": false
}
```

#### ❌ Supprimer une voiture (Admin uniquement)
```http
DELETE /api/cars/:id
Authorization: Bearer {admin_token}
```

### Réservations

#### 📅 Créer une réservation
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "carId": "65f8a1b2c3d4e5f6a7b8c9d0",
  "dateDebut": "2025-08-01",
  "dateFin": "2025-08-05"
}
```

**Contraintes :**
- Date de début ≥ aujourd'hui
- Date de fin > date de début
- Durée maximum : 30 jours
- Voiture disponible pour la période

#### 📋 Mes réservations
```http
GET /api/bookings/my
GET /api/bookings/my?statut=en_attente&page=1&limit=10
Authorization: Bearer {token}
```

**Statuts disponibles :**
- `en_attente`
- `confirmee`
- `en_cours`
- `terminee`
- `annulee`

#### 🔍 Détails d'une réservation
```http
GET /api/bookings/:id
Authorization: Bearer {token}
```

#### ❌ Annuler une réservation
```http
DELETE /api/bookings/:id
Authorization: Bearer {token}
```

#### 📊 Toutes les réservations (Admin uniquement)
```http
GET /api/bookings/admin/all?statut=confirmee&page=1&limit=20
Authorization: Bearer {admin_token}
```

## 🧪 Tests avec cURL

### 1. Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@email.com",
    "password": "MonPass1"
  }'
```

### 2. Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@email.com",
    "password": "MonPass1"
  }'
```

**💾 Sauvegarder le token :**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Créer un compte Admin

Se connecter à MongoDB :
```bash
mongosh
```

Puis exécuter :
```javascript
use car_rental_db
db.users.updateOne(
  { email: "jean@email.com" },
  { $set: { role: "admin" } }
)
```

### 4. Ajouter une voiture (Admin)
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "marque": "Renault",
    "modele": "Clio V",
    "prixParJour": 45.99,
    "image": "https://via.placeholder.com/400x300",
    "annee": 2023,
    "description": "Citadine économique et fiable"
  }'
```

### 5. Lister les voitures
```bash
curl http://localhost:5000/api/cars
```

Avec filtres :
```bash
curl "http://localhost:5000/api/cars?disponible=true&prixMax=50&search=renault"
```

### 6. Créer une réservation
```bash
# Récupérer l'ID d'une voiture depuis la liste
CAR_ID="65f8a1b2c3d4e5f6a7b8c9d0"

curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "carId": "'$CAR_ID'",
    "dateDebut": "2025-08-01",
    "dateFin": "2025-08-05"
  }'
```

### 7. Consulter mes réservations
```bash
curl http://localhost:5000/api/bookings/my \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Annuler une réservation
```bash
BOOKING_ID="65f8a1b2c3d4e5f6a7b8c9d1"

curl -X DELETE http://localhost:5000/api/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 🔒 Sécurité

### Mesures implémentées

1. **Authentification JWT** : Tokens sécurisés avec expiration
2. **Hashage des mots de passe** : bcrypt avec salt de 12 rounds
3. **Validation des données** : express-validator sur tous les endpoints
4. **Rate limiting** : 100 requêtes max par IP / 15 minutes
5. **Headers sécurisés** : Helmet.js
6. **CORS** : Configuration stricte des origines autorisées
7. **Sanitisation** : Protection XSS et injection NoSQL
8. **Gestion des erreurs** : Pas de fuite d'informations sensibles

### Recommandations Production

- ✅ Utiliser HTTPS
- ✅ Changer JWT_SECRET avec une clé forte
- ✅ Activer les logs dans MongoDB
- ✅ Mettre en place des backups réguliers
- ✅ Configurer un pare-feu
- ✅ Limiter les tentatives de connexion
- ✅ Mettre à jour régulièrement les dépendances

## 📊 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource introuvable |
| 409 | Conflit (ex: email déjà existant) |
| 500 | Erreur serveur |

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier le statut
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod
```

### Port 5000 déjà utilisé
Changer le port dans `.env` :
```env
PORT=3001
```

### Erreur de connexion MongoDB
Vérifier `MONGO_URI` dans `.env` et que MongoDB est démarré.

### Token JWT invalide
Vérifier que le token est bien envoyé dans le header :
```
Authorization: Bearer {votre_token}
```

## 📝 Variables d'Environnement

| Variable | Description | Défaut | Requis |
|----------|-------------|--------|--------|
| PORT | Port du serveur | 5000 | Non |
| NODE_ENV | Environnement | development | Non |
| MONGO_URI | URI MongoDB | localhost:27017 | Oui |
| JWT_SECRET | Secret pour JWT | - | Oui |
| JWT_EXPIRE | Durée validité token | 7d | Non |
| CLIENT_URL | URL frontend | * | Non |

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur
zakaria254
zakari2-ben
RANGOO-101
mohammedTaouille

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**⭐ N'oubliez pas de mettre une étoile si ce projet vous a aidé !**