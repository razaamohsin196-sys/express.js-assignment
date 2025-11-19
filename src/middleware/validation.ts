import { body, param, ValidationChain } from 'express-validator';
import validator from 'validator';

export const validateUserId: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
    .toInt(),
];

export const validateCreateUser: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .customSanitizer((value: string) => validator.escape(value))
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
    .customSanitizer((value: string) => validator.normalizeEmail(value) || value)
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
];

export const validateQueryLimit: ValidationChain[] = [
  param('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
    .toInt(),
];

export const validateMetricsWindow: ValidationChain[] = [
  param('window')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Window must be at least 1000ms')
    .toInt(),
];