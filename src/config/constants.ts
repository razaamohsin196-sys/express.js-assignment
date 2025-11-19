import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server configuration constants
 */
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  CAPACITY: parseInt(process.env.CACHE_CAPACITY || '100', 10),
  TTL_MS: parseInt(process.env.CACHE_TTL_MS || '60000', 10), // 60 seconds
  CLEANUP_INTERVAL_MS: 30000, // 30 seconds
} as const;

/**
 * Rate limiting configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  burstCapacity: parseInt(process.env.RATE_LIMIT_BURST_CAPACITY || '5', 10),
  burstWindowMs: parseInt(process.env.RATE_LIMIT_BURST_WINDOW_MS || '10000', 10), // 10 seconds
};

/**
 * Database simulation constants
 */
export const DB_SIMULATION = {
  DELAY_MS: 200, // Simulated database delay
} as const;