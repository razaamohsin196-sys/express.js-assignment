export interface RequestMetrics {
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  cacheHit: boolean;
}

export interface ErrorMetrics {
  timestamp: number;
  error: string;
  path: string;
  statusCode: number;
}

export interface MetricsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  requestsByEndpoint: Record<string, number>;
  errorsByType: Record<string, number>;
  responseTimePercentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
  uptime: number;
}