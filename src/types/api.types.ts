export interface ErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
  retryAfter?: number;
}

export interface CacheOperationResponse {
  message: string;
  clearedEntries?: number;
}