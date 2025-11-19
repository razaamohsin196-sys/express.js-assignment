import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import logger from '../utils/logger';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const user = await userService.getUser(id, (hit) => {
        res.setHeader('X-Cache-Hit', hit.toString());
      });

      if (!user) {
        logger.info(`User ${id} not found`);
        res.status(404).json({
          error: 'Not Found',
          message: `User with ID ${id} not found`,
        });
        return;
      }

      logger.debug(`User ${id} retrieved successfully`);
      res.json(user);
    } catch (error) {
      logger.error(`Error retrieving user ${req.params.id}:`, error);
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body;

      const user = await userService.createUser(name, email);

      logger.info(`User created: ${user.id} - ${user.email}`);
      res.status(201).json(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      next(error);
    }
  }
}

export const userController = new UserController();