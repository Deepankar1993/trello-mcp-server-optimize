/**
 * Cache Manager for Optimized Responses
 * 
 * Provides in-memory caching for optimized Trello API responses
 * to reduce redundant API calls and improve performance.
 */

import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import config from '../config.js';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  operation: string;
  config?: RuntimeOptimizationConfig;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(maxSize: number = 1000, defaultTTL: number = 300) { // 5 minutes default
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    };
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cleanupInterval = null;
    
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Generate cache key from operation and parameters
   */
  private generateKey(
    operation: string,
    params: any,
    config?: RuntimeOptimizationConfig
  ): string {
    const keyParts = [operation];
    
    // Add relevant params to key
    if (params) {
      keyParts.push(JSON.stringify(params));
    }
    
    // Add optimization config to key
    if (config) {
      keyParts.push(JSON.stringify({
        level: config.level,
        fields: config.fields,
        maxItems: config.maxItems,
        summarize: config.summarize
      }));
    }
    
    return keyParts.join(':');
  }

  /**
   * Get cached data if available and not expired
   */
  get(
    operation: string,
    params: any,
    config?: RuntimeOptimizationConfig
  ): any | null {
    const key = this.generateKey(operation, params, config);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl * 1000) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Store data in cache
   */
  set(
    operation: string,
    params: any,
    data: any,
    config?: RuntimeOptimizationConfig,
    ttl?: number
  ): void {
    const key = this.generateKey(operation, params, config);
    
    // Enforce max size with LRU eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      operation,
      config
    });
    
    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate cache entries by operation
   */
  invalidateByOperation(operation: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.operation === operation) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.timestamp + entry.ttl * 1000) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.cache.delete(key));
      this.stats.size = this.cache.size;
    }, 60000); // Run every minute
  }

  /**
   * Stop periodic cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Determine if an operation should be cached
   */
  static shouldCache(operation: string): boolean {
    // Cache read operations, not write operations
    const cacheableOperations = [
      'get_boards', 'get_board', 'get_board_lists', 'get_board_members', 'get_board_labels',
      'get_list', 'get_cards_in_list',
      'get_card', 'get_comments', 'get_attachments', 'get_card_members', 'get_card_labels',
      'get_me', 'get_member', 'get_member_boards', 'get_member_cards',
      'get_label', 'get_checklist', 'get_checkitems', 'get_checkitem'
    ];
    
    return cacheableOperations.includes(operation);
  }

  /**
   * Get appropriate TTL for an operation
   */
  static getTTLForOperation(operation: string): number {
    // Different TTLs for different operation types
    const ttlMap: Record<string, number> = {
      // User info changes less frequently
      'get_me': 600, // 10 minutes
      'get_member': 600,
      
      // Board structure is relatively stable
      'get_boards': 300, // 5 minutes
      'get_board': 300,
      'get_board_lists': 300,
      'get_board_members': 300,
      'get_board_labels': 300,
      
      // Cards and comments change more frequently
      'get_card': 120, // 2 minutes
      'get_cards_in_list': 120,
      'get_comments': 60, // 1 minute
      'get_attachments': 180, // 3 minutes
      
      // Default
      default: 180 // 3 minutes
    };
    
    return ttlMap[operation] || ttlMap.default;
  }
}

// Export singleton instance with configuration
export const cacheManager = new CacheManager(
  config.optimization.cacheMaxSize,
  300 // Default TTL in seconds
);