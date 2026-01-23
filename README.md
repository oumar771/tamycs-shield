# Application de Gestion de Comptes Utilisateurs

Projet de Programmation Sécurisée - Bachelor 3 / IRA5 - ESAIP

## Description

Application web sécurisée de gestion de comptes utilisateurs intégrant :
- Inscription et authentification
- Espace personnel sécurisé
- Gestion des rôles (Utilisateur / Administrateur)

## Fonctionnalités

### Utilisateur
- Inscription avec validation des données
- Connexion sécurisée
- Modification du profil (nom, email)
- Changement de mot de passe
- Visualisation des informations de sécurité (date de création, dernière connexion)

### Administrateur
- Visualisation de la liste des utilisateurs
- Modification des rôles utilisateurs
- Suppression de comptes

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd tamycs-shield

# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env
# Modifier les valeurs dans .env selon votre environnement

# Lancer le serveur
npm start
```

## Configuration

Créer un fichier `.env` à la racine avec :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/secureapp
JWT_SECRET=votre-cle-secrete-a-changer
NODE_ENV=development
```

## Stack Technique

- **Backend:** Node.js, Express.js
- **Base de données:** MongoDB avec Mongoose
- **Authentification:** JWT (JSON Web Tokens)
- **Hashage:** bcrypt (12 rounds)
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Mesures de Sécurité Implémentées

### Côté Serveur

1. **Hashage des mots de passe**
   - Utilisation de bcrypt avec un facteur de coût de 12
   - Les mots de passe ne sont jamais stockés en clair

2. **Protection contre les injections SQL/NoSQL**
   - Utilisation de Mongoose avec schémas typés
   - Validation des entrées avec express-validator

3. **Protection XSS**
   - Échappement des données côté client (fonction escapeHtml)
   - Headers de sécurité avec Helmet (X-XSS-Protection, Content-Security-Policy)

4. **Protection CSRF**
   - Utilisation de tokens JWT dans les headers Authorization
   - Pas de cookies de session

5. **Gestion sécurisée des sessions**
   - Tokens JWT avec expiration (24h)
   - Stockage côté client dans localStorage

6. **Rate Limiting**
   - Limitation des tentatives de connexion (5/15min)
   - Protection contre les attaques par force brute

7. **Headers de sécurité (Helmet)**
   - Content-Security-Policy
   - X-Frame-Options (protection clickjacking)
   - X-Content-Type-Options
   - HSTS

8. **Validation des entrées**
   - Validation côté serveur avec express-validator
   - Validation côté client en JavaScript

## Structure du Projet

```
├── public/
│   ├── css/
│   │   └── style.css       # Styles de l'application
│   ├── js/
│   │   └── app.js          # Logique frontend
│   └── index.html          # Page principale
├── src/
│   ├── controllers/
│   │   └── authController.js   # Logique d'authentification
│   ├── middleware/
│   │   ├── auth.js             # Vérification JWT
│   │   └── rateLimit.js        # Rate limiting
│   ├── models/
│   │   └── User.js             # Modèle utilisateur
│   ├── routes/
│   │   └── auth.js             # Routes API
│   ├── utils/
│   │   └── jwt.js              # Utilitaires JWT
│   └── index.js                # Point d'entrée serveur
├── .env                    # Configuration (non versionné)
├── package.json
└── README.md
```

## API Endpoints

### Authentification (publiques)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Utilisateur (authentifié)
- `PUT /api/auth/profile` - Modifier le profil
- `PUT /api/auth/password` - Changer le mot de passe

### Administration (admin uniquement)
- `GET /api/auth/users` - Liste des utilisateurs
- `PUT /api/auth/users/:id/role` - Modifier un rôle
- `DELETE /api/auth/users/:id` - Supprimer un utilisateur

## Utilisation

1. Accéder à `http://localhost:3000`
2. Créer un compte via le bouton "Inscription"
3. Se connecter avec ses identifiants
4. Accéder à son espace personnel

Pour créer un administrateur, modifier directement le rôle dans la base de données :
```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Développement

Ce projet a été développé dans le cadre du cours de Programmation Sécurisée.

**Équipe :**
- Étudiant 1 : Développeur
- Étudiant 2 : Analyste Sécurité

## Licence

MIT
