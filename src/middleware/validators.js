const { body, validationResult } = require('express-validator');

const passwordValidator = [
  body('password')
    .isLength({ min: 12 })
    .withMessage('Le mot de passe doit contenir au moins 12 caractères')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
];

const emailValidator = [
  body('email').isEmail().normalizeEmail()
];

module.exports = { passwordValidator, emailValidator, validationResult };
