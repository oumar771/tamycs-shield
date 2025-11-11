# Sprint 1 - Tamycs Shield
**Dates :** 09/11/2025 - 16/11/2025

## 🎯 Objectif du Sprint
Mettre en place les fonctionnalités de base du gestionnaire de mots de passe :
- Authentification utilisateur sécurisée
- Générateur de mots de passe
- Début du stockage chiffré

## 📊 User Stories

### US-001 : Inscription utilisateur ✅
**En tant qu'** utilisateur
**Je veux** créer un compte sécurisé
**Afin de** pouvoir utiliser le gestionnaire de mots de passe

**Critères d'acceptation :**
- [x] Formulaire d'inscription avec email et mot de passe maître
- [x] Validation ANSSI du mot de passe (12 caractères min, 3 types de caractères)
- [x] Hachage bcrypt du mot de passe maître
- [x] Stockage sécurisé en base de données

**Points de complexité :** 5
**Statut :** ✅ Complété (12/11/2025)

---

### US-002 : Authentification ✅
**En tant qu'** utilisateur inscrit
**Je veux** me connecter de manière sécurisée
**Afin d'** accéder à mes mots de passe

**Critères d'acceptation :**
- [x] Système de login avec JWT
- [x] Refresh tokens (durée de vie 7 jours)
- [x] Protection contre le brute force (rate limiting)
- [x] Gestion des sessions

**Points de complexité :** 8
**Statut :** ✅ Complété (13/11/2025)

---

### US-003 : Générateur de mots de passe ✅
**En tant qu'** utilisateur
**Je veux** générer des mots de passe robustes
**Afin de** sécuriser mes comptes

**Critères d'acceptation :**
- [x] Options personnalisables (longueur, types de caractères)
- [x] Calcul d'entropie en temps réel
- [x] Copie sécurisée dans le presse-papier
- [x] Affichage de la force du mot de passe

**Points de complexité :** 5
**Statut :** ✅ Complété (14/11/2025)

---

### US-004 : Stockage sécurisé des mots de passe 🟡
**En tant qu'** utilisateur
**Je veux** stocker mes mots de passe de manière chiffrée
**Afin de** les retrouver en toute sécurité

**Critères d'acceptation :**
- [x] Chiffrement AES-256-GCM
- [x] Dérivation de clé PBKDF2 (100,000 itérations)
- [ ] CRUD complet (Create, Read, Update, Delete)
- [ ] Validation des entrées

**Points de complexité :** 13
**Statut :** 🟡 En cours (70% complété)
**Note :** Le chiffrement est implémenté, mais le CRUD complet sera finalisé en Sprint 2

## 📈 Métriques du Sprint

### Vélocité
- **Plannifié :** 31 points
- **Complété :** 22 points (71%)
- **Report Sprint 2 :** 9 points (US-004)

### Répartition du temps
| Activité | Temps (heures) |
|----------|---------------|
| Développement | 28h |
| Tests | 6h |
| Code review | 4h |
| Documentation | 2h |
| **Total** | **40h** |

### Qualité du code
- **Tests unitaires :** 15 tests
- **Couverture de code :** 72%
- **Bugs détectés :** 3
- **Bugs résolus :** 3

## 🔄 Daily Standups

### Lundi 11/11
- Mise en place du projet
- Configuration de l'environnement de dev
- Début US-001

### Mardi 12/11
- Finalisation US-001
- Début US-002 (authentification JWT)

### Mercredi 13/11
- Finalisation US-002
- Début US-003 (générateur)

### Jeudi 14/11
- Finalisation US-003
- Début US-004 (crypto)

### Vendredi 15/11
- Implémentation chiffrement AES-256-GCM
- Tests unitaires
- Documentation

### Samedi 16/11
- Sprint Review
- Sprint Retrospective

## 🎓 Apprentissages

### Ce qui a bien fonctionné ✅
- Bonne coordination de l'équipe
- Respect des normes ANSSI
- Qualité du code élevée
- Tests systématiques

### Difficultés rencontrées ⚠️
- Complexité de l'implémentation du chiffrement
- Temps sous-estimé pour US-004
- Problèmes avec PBKDF2 (résolu)

### Points d'amélioration 🔧
- Mieux découper les User Stories complexes
- Prévoir plus de temps pour les tests
- Améliorer la documentation technique

## 📝 Décisions techniques

1. **Chiffrement :** AES-256-GCM (recommandation ANSSI)
2. **Dérivation de clé :** PBKDF2 avec 100,000 itérations
3. **Hachage :** bcrypt avec 12 rounds
4. **JWT :** Access token (15min) + Refresh token (7j)
5. **Rate limiting :** 5 tentatives / 15 minutes

## 🚀 Préparation Sprint 2

### Objectifs
- Finaliser US-004 (CRUD complet)
- Implémenter la recherche et le filtrage (US-005)
- Développer l'interface utilisateur (US-006)
- Système de catégorisation (US-007)

### Risques identifiés
- Intégration front-end/back-end
- Performance de la recherche
- Responsive design

---

**Sprint Review :** Samedi 16/11/2025 - 16h00
**Sprint Retrospective :** Samedi 16/11/2025 - 17h00
**Prochaine Planning :** Lundi 18/11/2025 - 09h00
