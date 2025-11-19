import { QueueTask } from '../types';
import logger from '../utils/logger';

/**
 * Queue Service for async task processing
 */
export class QueueService {
  private queue: QueueTask<any>[];
  private processing: boolean;
  private pendingRequests: Map<string, Promise<any>>;

  constructor() {
    this.queue = [];
    this.processing = false;
    this.pendingRequests = new Map();
  }

  async enqueue<T>(taskId: string, taskFn: () => Promise<T>): Promise<T> {
    const existingPromise = this.pendingRequests.get(taskId);
    if (existingPromise) {
      logger.debug(`[QUEUE] Request ${taskId} already in progress, returning existing promise`);
      return existingPromise as Promise<T>;
    }

    const promise = new Promise<T>((resolve, reject) => {
      const task: QueueTask<T> = {
        id: taskId,
        execute: taskFn,
        resolve,
        reject,
      };

      this.queue.push(task);
      logger.debug(`[QUEUE] Task ${taskId} added to queue. Queue size: ${this.queue.length}`);
    });

    this.pendingRequests.set(taskId, promise);
    
    if (!this.processing) {
      this.processQueue();
    }

    return promise;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;
    logger.debug('[QUEUE] Starting queue processing');

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) {
        continue;
      }

      try {
        logger.debug(`[QUEUE] Processing task ${task.id}`);
        const startTime = Date.now();
        
        const result = await task.execute();
        
        const duration = Date.now() - startTime;
        logger.debug(`[QUEUE] Task ${task.id} completed in ${duration}ms`);
        
        task.resolve(result);
      } catch (error) {
        logger.error(`[QUEUE] Task ${task.id} failed:`, error);
        task.reject(error as Error);
      } finally {
        this.pendingRequests.delete(task.id);
      }
    }

    this.processing = false;
    logger.debug('[QUEUE] Queue processing completed');
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  isProcessing(): boolean {
    return this.processing;
  }

  clear(): void {
    this.queue = [];
    this.pendingRequests.clear();
    this.processing = false;
  }
}

export const queueService = new QueueService();