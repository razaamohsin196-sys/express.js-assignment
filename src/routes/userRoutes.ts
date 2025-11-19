import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validateUserId, validateCreateUser } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/validationErrorHandler';

const router = Router();

router.get(
  '/:id',
  validateUserId,
  handleValidationErrors,
  userController.getUserById.bind(userController)
);

router.post(
  '/',
  validateCreateUser,
  handleValidationErrors,
  userController.createUser.bind(userController)
);

export default router;