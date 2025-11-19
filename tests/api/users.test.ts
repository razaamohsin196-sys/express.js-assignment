import request from 'supertest';
import createApp from '../../src/app';
import { Application } from 'express';
import { rateLimiter } from '../../src/middleware/rateLimiter';
import { cacheManager } from '../../src/cache/CacheManager';

describe('User API Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    rateLimiter.clear();
    cacheManager.clear();
  });

  afterAll((done) => {
    cacheManager.stopCleanupTask();
    rateLimiter.stopCleanupTask();
    setTimeout(done, 100);
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(app)
        .get('/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('email', 'john@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toContain('User with ID 999 not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/users/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for negative user ID', async () => {
      const response = await request(app)
        .get('/users/-1')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should set cache header on response', async () => {
      await request(app).delete('/cache'); // Clear cache first
      
      const firstResponse = await request(app)
        .get('/users/1')
        .expect(200);
      
      expect(firstResponse.headers['x-cache-hit']).toBe('false');

      const secondResponse = await request(app)
        .get('/users/1')
        .expect(200);
      
      expect(secondResponse.headers['x-cache-hit']).toBe('true');
    });

    it('should handle concurrent requests efficiently', async () => {
      rateLimiter.clear();
      cacheManager.clear();
      
      const promises = Array(3).fill(null).map(() =>
        request(app).get('/users/2')
      );
      
      const responses = await Promise.all(promises);
      
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
      successfulResponses.forEach(response => {
        expect(response.body.id).toBe(2);
      });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newUser.name);
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/users')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
          }),
        ])
      );
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: '   ',
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should sanitize user input', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: "  Test User  ",
          email: "  TEST@EXAMPLE.COM  ",
        })
        .expect(201);

      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should reject names with invalid characters', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test<script>alert("xss")</script>',
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('GET /cache-status', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/cache-status')
        .expect(200);

      expect(response.body).toHaveProperty('cacheSize');
      expect(response.body).toHaveProperty('hits');
      expect(response.body).toHaveProperty('misses');
      expect(response.body).toHaveProperty('hitRate');
      expect(response.body).toHaveProperty('avgResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('DELETE /cache', () => {
    it('should clear the cache', async () => {
      await request(app).get('/users/1'); // Add something to cache
      
      const response = await request(app)
        .delete('/cache')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cache cleared successfully');
      expect(response.body).toHaveProperty('clearedEntries');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(15).fill(null).map((_, i) => 
        request(app).get('/users/1').then(res => ({ index: i, status: res.status }))
      );

      const responses = await Promise.all(requests);
      
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});