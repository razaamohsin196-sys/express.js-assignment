import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    logger.warn(`Validation failed for ${req.method} ${req.path}`, {
      errors: errorMessages,
      body: req.body,
      params: req.params,
    });

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errorMessages,
    });
    return;
  }

  next();
};