import { User } from '../types';
import { cacheManager } from '../cache/CacheManager';
import { queueService } from './queueService';
import { mockUsers, getNextUserId, addUser, getUserById } from '../utils/mockData';
import { DB_SIMULATION } from '../config/constants';
import logger from '../utils/logger';

export class UserService {
  private async fetchUserFromDB(id: number): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = getUserById(id);
        logger.debug(`[DB] Fetched user ${id} from database: ${user ? 'found' : 'not found'}`);
        resolve(user || null);
      }, DB_SIMULATION.DELAY_MS);
    });
  }

  async getUser(id: number, setCacheHeader?: (hit: boolean) => void): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const startTime = Date.now();

    const cached = cacheManager.get(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      cacheManager.trackResponseTime(duration);
      logger.debug(`[CACHE HIT] User ${id} retrieved from cache in ${duration}ms`);
      if (setCacheHeader) setCacheHeader(true);
      return cached;
    }

    logger.debug(`[CACHE MISS] User ${id} not in cache, fetching from database`);

    const user = await queueService.enqueue(
      cacheKey,
      () => this.fetchUserFromDB(id)
    );

    const duration = Date.now() - startTime;
    cacheManager.trackResponseTime(duration);

    if (setCacheHeader) setCacheHeader(false);

    if (user) {
      cacheManager.set(cacheKey, user);
      logger.debug(`[CACHE SET] User ${id} cached for ${duration}ms total request time`);
    }

    return user;
  }

  async createUser(name: string, email: string): Promise<User> {
    const id = getNextUserId();
    const user: User = {
      id,
      name,
      email,
      createdAt: new Date(),
    };

    addUser(user);

    const cacheKey = `user:${id}`;
    cacheManager.set(cacheKey, user);

    logger.info(`[USER CREATED] User ${id} created and cached`);

    return user;
  }

  async userExists(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    return user !== null;
  }

  getAllUsers(): User[] {
    return Array.from(mockUsers.values());
  }
}

export const userService = new UserService();