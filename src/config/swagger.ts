import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express.js User Data API',
      version: '1.0.0',
      description: 'A highly efficient Express.js API with advanced caching, rate limiting, and asynchronous processing',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Cache',
        description: 'Cache management endpoints',
      },
      {
        name: 'Monitoring',
        description: 'Performance monitoring endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'User name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string',
              description: 'User name',
              example: 'Jane Smith',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'jane@example.com',
            },
          },
        },
        CacheStats: {
          type: 'object',
          properties: {
            cacheSize: {
              type: 'integer',
              description: 'Current number of cached entries',
              example: 3,
            },
            hits: {
              type: 'integer',
              description: 'Number of cache hits',
              example: 15,
            },
            misses: {
              type: 'integer',
              description: 'Number of cache misses',
              example: 5,
            },
            hitRate: {
              type: 'string',
              description: 'Cache hit rate percentage',
              example: '75.00%',
            },
            avgResponseTime: {
              type: 'string',
              description: 'Average response time',
              example: '45.50ms',
            },
            uptime: {
              type: 'string',
              description: 'Server uptime',
              example: '3600s',
            },
          },
        },
        MetricsSummary: {
          type: 'object',
          properties: {
            totalRequests: {
              type: 'integer',
              description: 'Total number of requests',
              example: 100,
            },
            successfulRequests: {
              type: 'integer',
              description: 'Number of successful requests',
              example: 95,
            },
            failedRequests: {
              type: 'integer',
              description: 'Number of failed requests',
              example: 5,
            },
            averageResponseTime: {
              type: 'number',
              description: 'Average response time in milliseconds',
              example: 45.5,
            },
            cacheHitRate: {
              type: 'number',
              description: 'Cache hit rate percentage',
              example: 75.0,
            },
            errorRate: {
              type: 'number',
              description: 'Error rate percentage',
              example: 5.0,
            },
            requestsByEndpoint: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: 'Request count by endpoint',
              example: {
                'GET /users/:id': 50,
                'POST /users': 10,
              },
            },
            errorsByType: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: 'Error count by type',
              example: {
                'Not Found': 3,
                'Validation Error': 2,
              },
            },
            responseTimePercentiles: {
              type: 'object',
              properties: {
                p50: {
                  type: 'number',
                  description: '50th percentile response time',
                  example: 30.5,
                },
                p95: {
                  type: 'number',
                  description: '95th percentile response time',
                  example: 150.2,
                },
                p99: {
                  type: 'number',
                  description: '99th percentile response time',
                  example: 250.8,
                },
              },
            },
            uptime: {
              type: 'integer',
              description: 'Server uptime in seconds',
              example: 3600,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Not Found',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'User not found',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
              example: 404,
            },
          },
        },
        RateLimitError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Too Many Requests',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Rate limit exceeded. Please try again later.',
            },
            retryAfter: {
              type: 'integer',
              description: 'Seconds to wait before retrying',
              example: 60,
            },
          },
        },
        CacheOperationResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Operation result message',
              example: 'Cache cleared successfully',
            },
            clearedEntries: {
              type: 'integer',
              description: 'Number of entries cleared',
              example: 5,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);