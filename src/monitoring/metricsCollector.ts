import { RequestMetrics, ErrorMetrics, MetricsSummary } from '../types';

export class MetricsCollector {
  private requests: RequestMetrics[] = [];
  private errors: ErrorMetrics[] = [];
  private startTime: number = Date.now();
  private maxStoredMetrics: number = 10000;

  recordRequest(metrics: RequestMetrics): void {
    this.requests.push(metrics);
    
    if (this.requests.length > this.maxStoredMetrics) {
      this.requests.shift();
    }
  }

  recordError(error: ErrorMetrics): void {
    this.errors.push(error);
    
    if (this.errors.length > this.maxStoredMetrics) {
      this.errors.shift();
    }
  }

  getSummary(timeWindowMs?: number): MetricsSummary {
    const now = Date.now();
    const cutoff = timeWindowMs ? now - timeWindowMs : 0;
    
    const recentRequests = this.requests.filter(r => r.timestamp >= cutoff);
    const recentErrors = this.errors.filter(e => e.timestamp >= cutoff);
    
    const totalRequests = recentRequests.length;
    const successfulRequests = recentRequests.filter(r => r.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = recentRequests.map(r => r.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    const cacheHits = recentRequests.filter(r => r.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    
    const requestsByEndpoint: Record<string, number> = {};
    recentRequests.forEach(r => {
      const key = `${r.method} ${r.path}`;
      requestsByEndpoint[key] = (requestsByEndpoint[key] || 0) + 1;
    });
    
    const errorsByType: Record<string, number> = {};
    recentErrors.forEach(e => {
      errorsByType[e.error] = (errorsByType[e.error] || 0) + 1;
    });
    
    const p50 = this.getPercentile(responseTimes, 50);
    const p95 = this.getPercentile(responseTimes, 95);
    const p99 = this.getPercentile(responseTimes, 99);
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      requestsByEndpoint,
      errorsByType,
      responseTimePercentiles: {
        p50: Math.round(p50 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
      },
      uptime: Math.floor((now - this.startTime) / 1000),
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  getRecentRequests(limit: number = 100): RequestMetrics[] {
    return this.requests.slice(-limit);
  }

  getRecentErrors(limit: number = 100): ErrorMetrics[] {
    return this.errors.slice(-limit);
  }

  reset(): void {
    this.requests = [];
    this.errors = [];
    this.startTime = Date.now();
  }
}

export const metricsCollector = new MetricsCollector();