# 🛡️ Tamycs Shield - Secure PassVault

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Security](https://img.shields.io/badge/security-ANSSI%20compliant-red.svg)

## 📋 Description

**Tamycs Shield** est un gestionnaire de mots de passe sécurisé développé dans le cadre d'un projet Bachelor 3 Cybersécurité à l'ESAIP. Ce projet respecte les recommandations de sécurité de l'ANSSI et implémente les meilleures pratiques en matière de cryptographie.

## ✨ Fonctionnalités

### 🔐 Sécurité
- ✅ Chiffrement AES-256-GCM pour le stockage des mots de passe
- ✅ Dérivation de clé PBKDF2 (100,000 itérations)
- ✅ Hachage bcrypt pour le mot de passe maître
- ✅ Authentification JWT avec refresh tokens
- ✅ Protection contre les attaques par force brute (rate limiting)

### 🎯 Fonctionnalités utilisateur
- ✅ Inscription et authentification sécurisée
- ✅ Générateur de mots de passe robustes
- ✅ Calcul d'entropie en temps réel
- ✅ Stockage sécurisé des identifiants
- ✅ Recherche et filtrage par catégories
- ✅ Interface responsive (mobile/desktop)
- ✅ Mode sombre / Mode clair
- ✅ Copie sécurisée dans le presse-papier

## 🏗️ Architecture Technique

### Stack Technologique
- **Backend:** Node.js + Express.js
- **Base de données:** MongoDB
- **Chiffrement:** Node.js Crypto (AES-256-GCM)
- **Authentification:** JWT + bcrypt
- **Tests:** Jest
- **CI/CD:** GitHub Actions

### Normes de sécurité
- 🔒 Conformité ANSSI (politique de mots de passe)
- 🔒 OWASP Top 10 (protection contre les vulnérabilités courantes)
- 🔒 RGPD compliant (données personnelles chiffrées)

## 🚀 Installation

### Prérequis
```bash
node >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0
```

### Installation locale
```bash
# Cloner le projet
git clone https://github.com/votre-username/tamycs-shield.git
cd tamycs-shield

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Lancer MongoDB (Docker)
docker-compose up -d mongodb

# Lancer le serveur de développement
npm run dev
```

## 📚 Documentation

### Variables d'environnement
Voir le fichier [`.env.example`](.env.example) pour la configuration complète.

### API Documentation
Une fois le serveur lancé, accédez à la documentation Swagger :
```
http://localhost:3000/api-docs
```

### Sprints
- [Sprint 1 (09/11 - 16/11/2025)](docs/sprints/SPRINT-1.md)
- [Sprint 2 (17/11 - 22/11/2025)](docs/sprints/SPRINT-2.md)

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

**Objectif de couverture :** 85%

## 📊 User Stories

| ID | User Story | Sprint | Status |
|----|-----------|--------|--------|
| US-001 | Inscription utilisateur | 1 | ✅ Complété |
| US-002 | Authentification | 1 | ✅ Complété |
| US-003 | Générateur de mots de passe | 1 | ✅ Complété |
| US-004 | Stockage sécurisé | 1-2 | ✅ Complété |
| US-005 | Recherche et filtrage | 2 | ✅ Complété |
| US-006 | Interface utilisateur | 2 | ✅ Complété |
| US-007 | Catégorisation | 2 | ✅ Complété |

## 👥 Équipe

**Bachelor 3 Cybersécurité - ESAIP (2025)**
- 6 développeurs
- Méthodologie : Agile Scrum
- Durée : 2 sprints de 1 semaine

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les règles de contribution.

## 📞 Contact

Pour toute question concernant ce projet, veuillez ouvrir une issue sur GitHub.

---

**⚠️ Avertissement de sécurité**

Ce projet est développé à des fins éducatives. Pour une utilisation en production, veuillez effectuer un audit de sécurité complet.
