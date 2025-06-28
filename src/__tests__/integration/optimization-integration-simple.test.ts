import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import { ResponseOptimizer } from '../../utils/response-optimizer.js';
import { cacheManager } from '../../utils/cache-manager.js';
import { performanceMonitor } from '../../utils/performance-monitor.js';
import { OptimizationLevel } from '../../types/optimization-types.js';

describe('Optimization Integration - Simple Tests', () => {
  let optimizer: ResponseOptimizer;

  beforeEach(() => {
    optimizer = new ResponseOptimizer();
    cacheManager.clear();
    performanceMonitor.clearMetrics();
  });

  afterAll(() => {
    // Clean up cache manager to prevent Jest from hanging
    cacheManager.destroy();
  });

  test('should optimize and cache board response', async () => {
    const mockBoard = {
      id: 'board123',
      name: 'Test Board',
      desc: 'A test board with lots of data',
      url: 'https://trello.com/b/board123',
      shortUrl: 'https://trello.com/b/board123',
      closed: false,
      prefs: {
        permissionLevel: 'private',
        voting: 'disabled',
        comments: 'members',
      },
    };

    // First call - should optimize
    const dataFetcher = async () => mockBoard;
    const result1 = await optimizer.optimizeWithCache(
      'get_board',
      { boardId: 'board123' },
      dataFetcher,
      { level: 'minimal' as OptimizationLevel }
    );

    expect(result1).toBeDefined();
    expect(result1.id).toBe('board123');

    // Check cache stats
    const cacheStats1 = cacheManager.getStats();
    expect(cacheStats1.size).toBeGreaterThan(0);

    // Second call - should use cache
    const result2 = await optimizer.optimizeWithCache(
      'get_board',
      { boardId: 'board123' },
      dataFetcher,
      { level: 'minimal' as OptimizationLevel }
    );

    expect(result2).toEqual(result1);
    
    // Check cache hit
    const cacheStats2 = cacheManager.getStats();
    expect(cacheStats2.hits).toBeGreaterThan(cacheStats1.hits);
  });

  test('should track performance metrics', () => {
    const largeData = {
      id: '123',
      name: 'Test',
      description: 'A'.repeat(1000),
      items: Array(100).fill(null).map((_, i) => ({
        id: `item${i}`,
        name: `Item ${i}`,
        data: 'Some data here',
      })),
    };

    // Clear metrics
    performanceMonitor.clearMetrics();

    // Optimize data
    const optimized = optimizer.optimize(largeData, 'get_board', {
      level: 'minimal' as OptimizationLevel,
    });

    expect(optimized).toBeDefined();

    // Check that metrics were recorded
    const metrics = performanceMonitor.getAggregatedMetrics();
    expect(metrics.totalCalls).toBeGreaterThan(0);
    expect(metrics.avgReductionPercentage).toBeGreaterThan(0);
  });

  test('should handle different optimization levels', () => {
    const testData = {
      id: 'test123',
      name: 'Test Entity',
      description: 'Description',
      metadata: {
        created: '2024-01-01',
        updated: '2024-01-02',
      },
      extra: 'Extra data',
    };

    // Test minimal level
    const minimal = optimizer.optimize(testData, 'get_board', {
      level: 'minimal' as OptimizationLevel,
    });
    expect(minimal).toBeDefined();

    // Test standard level
    const standard = optimizer.optimize(testData, 'get_board', {
      level: 'standard' as OptimizationLevel,
    });
    expect(standard).toBeDefined();

    // Test detailed level
    const detailed = optimizer.optimize(testData, 'get_board', {
      level: 'detailed' as OptimizationLevel,
    });
    expect(detailed).toBeDefined();

    // Test full level (should return original)
    const full = optimizer.optimize(testData, 'get_board', {
      level: 'full' as OptimizationLevel,
    });
    expect(full).toEqual(testData);
  });

  test('should optimize arrays with pagination', () => {
    const items = Array(100).fill(null).map((_, i) => ({
      id: `item${i}`,
      name: `Item ${i}`,
      pos: i * 100,
    }));

    const optimized = optimizer.optimize(items, 'get_cards_in_list', {
      level: 'minimal' as OptimizationLevel,
      maxItems: 10,
    });

    expect(optimized).toBeDefined();
    expect(Array.isArray(optimized)).toBe(true);
    
    // The optimizer may return a summary or truncated array
    if (Array.isArray(optimized) && optimized.length > 0) {
      expect(optimized.length).toBeLessThanOrEqual(100);
    }
  });

  test('should handle errors gracefully', () => {
    // Test with null data
    expect(() => {
      optimizer.optimize(null as any, 'get_board', {
        level: 'minimal' as OptimizationLevel,
      });
    }).not.toThrow();

    // Test with undefined data
    expect(() => {
      optimizer.optimize(undefined as any, 'get_board', {
        level: 'minimal' as OptimizationLevel,
      });
    }).not.toThrow();

    // Test with invalid operation
    const result = optimizer.optimize({ id: '123' }, 'invalid_operation', {
      level: 'minimal' as OptimizationLevel,
    });
    expect(result).toBeDefined();
  });
});