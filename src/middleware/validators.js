const { body, validationResult } = require('express-validator');

const passwordValidator = [
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one digit')
    .matches(/[!@#$%^&*(),.?":{}|<>_+\-=[\]\\;']/)
    .withMessage('Password must contain at least one symbol')
];

const emailValidator = [
  body('email').isEmail().normalizeEmail()
];

module.exports = { passwordValidator, emailValidator, validationResult };
