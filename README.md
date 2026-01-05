# TAMYCS Shield

Gestionnaire de mots de passe sécurisé développé dans le cadre d'un projet Bachelor 3 Cybersécurité.

## Fonctionnalités

- **Générateur de mots de passe** - Modes aléatoire et mémorable avec mots français
- **Coffre-fort sécurisé** - Stockage chiffré (AES-256-GCM) de vos identifiants
- **Authentification sécurisée** - JWT et bcrypt
- **Catégorisation** - Organisez vos mots de passe par catégorie
- **Export de données** - CSV et JSON
- **Interface moderne** - Design inspiré de Proton Pass

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/tamycs-shield.git
cd tamycs-shield

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer le serveur
npm start
```

## Stack technique

- **Backend:** Node.js, Express.js
- **Base de données:** MongoDB
- **Sécurité:** AES-256-GCM, PBKDF2, bcrypt
- **Frontend:** Vanilla JavaScript

## Utilisation

1. Accéder à `http://localhost:3000`
2. Le générateur est accessible sans compte
3. Créer un compte pour sauvegarder vos mots de passe
4. Gérer vos identifiants depuis le dashboard

## Sécurité

- Chiffrement AES-256-GCM
- Dérivation de clé PBKDF2
- Protection contre les attaques par force brute
- Conformité ANSSI

## Développement

Ce projet a été développé en collaboration pour un projet académique de cybersécurité.

## License

MIT
