# Guide de Contribution - Tamycs Shield

Merci de contribuer à Tamycs Shield ! Ce document explique comment participer au projet.

## 🌳 Workflow Git

### Branches
- `main` : branche de production (stable)
- `dev` : branche de développement (intégration)
- `feature/*` : branches de fonctionnalités

### Convention de nommage des branches
```
feature/US-XXX-description-courte
bugfix/description-du-bug
hotfix/description-critique
```

### Exemple
```bash
git checkout dev
git pull origin dev
git checkout -b feature/US-008-export-passwords
```

## 📝 Commits

### Convention Conventional Commits
Nous utilisons la spécification [Conventional Commits](https://www.conventionalcommits.org/).

#### Format
```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

#### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, points-virgules manquants, etc.
- `refactor`: Refactoring du code
- `test`: Ajout de tests
- `chore`: Maintenance (dépendances, configuration)

#### Exemples
```bash
feat(auth): add JWT refresh token mechanism
fix(crypto): resolve AES-256-GCM initialization vector bug
docs(readme): update installation instructions
test(generator): add unit tests for password strength
```

## 🔀 Pull Requests

### Avant de créer une PR
1. ✅ Vérifier que tous les tests passent (`npm test`)
2. ✅ Vérifier le linting (`npm run lint`)
3. ✅ S'assurer que la branche est à jour avec `dev`

### Template de PR
```markdown
## Description
Décrivez les changements apportés

## User Story
US-XXX : Titre de la user story

## Type de changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Documentation
- [ ] Refactoring

## Tests
- [ ] Tests unitaires ajoutés
- [ ] Tests d'intégration ajoutés
- [ ] Tous les tests passent

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai commenté les parties complexes
- [ ] J'ai mis à jour la documentation
- [ ] Aucun warning de sécurité
```

### Processus de review
1. Au moins 1 review approuvée requise
2. Tous les checks CI/CD doivent être verts
3. Résoudre tous les commentaires avant merge

## 🧪 Tests

### Lancer les tests
```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

### Écrire des tests
- Couvrir les cas nominaux
- Couvrir les cas d'erreur
- Viser minimum 85% de couverture

## 🔒 Sécurité

### Checklist de sécurité
- ✅ Ne jamais commit de secrets (clés API, mots de passe)
- ✅ Utiliser `.env.example` pour les exemples
- ✅ Valider toutes les entrées utilisateur
- ✅ Utiliser des requêtes paramétrées (pas de SQL injection)
- ✅ Implémenter le rate limiting
- ✅ Suivre les recommandations OWASP

### Signaler une vulnérabilité
Envoyez un email privé à l'équipe (ne pas créer d'issue publique).

## 📊 Code Review

### Ce que nous vérifions
- ✅ Respect des conventions de code
- ✅ Tests présents et pertinents
- ✅ Pas de vulnérabilités de sécurité
- ✅ Performance acceptable
- ✅ Documentation à jour

### Temps de réponse
- Première review : sous 24h
- Merge : sous 48h après approbation

## 🎯 Méthodologie Agile

### Sprints
- Durée : 1 semaine
- Daily standup : 9h00
- Sprint review : Vendredi 16h00
- Sprint retrospective : Vendredi 17h00

### User Stories
Toutes les US sont trackées dans GitHub Projects.

## ❓ Questions

En cas de doute, ouvrez une issue ou contactez l'équipe !

Merci de contribuer à Tamycs Shield ! 🛡️
