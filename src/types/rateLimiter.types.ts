export interface RateLimitInfo {
  tokens: number;
  lastRefill: number;
  burstTokens: number;
  burstWindowStart: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstCapacity: number;
  burstWindowMs: number;
}