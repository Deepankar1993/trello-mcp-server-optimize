/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for measuring and tracking performance metrics
 * of the optimization system, including token reduction and response times.
 */

import { OptimizationLevel, OptimizationMetrics } from '../types/optimization-types.js';
import config from '../config.js';

interface PerformanceMetric {
  operation: string;
  timestamp: Date;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
  optimizationLevel: OptimizationLevel | 'cache';
  executionTime: number;
  cacheHit: boolean;
}

interface AggregatedMetrics {
  totalCalls: number;
  avgReductionPercentage: number;
  avgExecutionTime: number;
  totalOriginalTokens: number;
  totalOptimizedTokens: number;
  cacheHitRate: number;
  byOperation: Map<string, OperationMetrics>;
  byLevel: Map<string, LevelMetrics>;
}

interface OperationMetrics {
  calls: number;
  avgReduction: number;
  avgTime: number;
  cacheHits: number;
}

interface LevelMetrics {
  calls: number;
  avgReduction: number;
  totalReduction: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 10000;
  private enabled: boolean;

  constructor() {
    this.enabled = config.optimization.enableMetrics;
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    operation: string,
    originalData: any,
    optimizedData: any,
    level: OptimizationLevel | 'cache',
    startTime: number,
    cacheHit: boolean = false
  ): void {
    if (!this.enabled) return;

    const originalSize = this.estimateTokenCount(originalData);
    const optimizedSize = this.estimateTokenCount(optimizedData);
    const reductionPercentage = originalSize > 0 
      ? ((originalSize - optimizedSize) / originalSize) * 100 
      : 0;

    const metric: PerformanceMetric = {
      operation,
      timestamp: new Date(),
      originalSize,
      optimizedSize,
      reductionPercentage,
      optimizationLevel: level,
      executionTime: Date.now() - startTime,
      cacheHit
    };

    this.metrics.push(metric);

    // Maintain max size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log significant reductions
    if (config.debug && reductionPercentage > 50) {
      console.error(`[Performance] ${operation}: ${reductionPercentage.toFixed(1)}% reduction (${originalSize} → ${optimizedSize} tokens)`);
    }
  }

  /**
   * Estimate token count for data
   * Rough approximation: ~4 characters per token
   */
  private estimateTokenCount(data: any): number {
    if (data === null || data === undefined) {
      return 0;
    }
    const jsonString = JSON.stringify(data);
    return Math.ceil(jsonString.length / 4);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(timeWindow?: number): AggregatedMetrics {
    const cutoffTime = timeWindow 
      ? new Date(Date.now() - timeWindow) 
      : new Date(0);

    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (relevantMetrics.length === 0) {
      return {
        totalCalls: 0,
        avgReductionPercentage: 0,
        avgExecutionTime: 0,
        totalOriginalTokens: 0,
        totalOptimizedTokens: 0,
        cacheHitRate: 0,
        byOperation: new Map(),
        byLevel: new Map()
      };
    }

    // Calculate aggregates
    const totalOriginal = relevantMetrics.reduce((sum, m) => sum + m.originalSize, 0);
    const totalOptimized = relevantMetrics.reduce((sum, m) => sum + m.optimizedSize, 0);
    const totalReduction = relevantMetrics.reduce((sum, m) => sum + m.reductionPercentage, 0);
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const cacheHits = relevantMetrics.filter(m => m.cacheHit).length;

    // Group by operation
    const byOperation = new Map<string, OperationMetrics>();
    relevantMetrics.forEach(metric => {
      const existing = byOperation.get(metric.operation) || {
        calls: 0,
        avgReduction: 0,
        avgTime: 0,
        cacheHits: 0
      };

      byOperation.set(metric.operation, {
        calls: existing.calls + 1,
        avgReduction: (existing.avgReduction * existing.calls + metric.reductionPercentage) / (existing.calls + 1),
        avgTime: (existing.avgTime * existing.calls + metric.executionTime) / (existing.calls + 1),
        cacheHits: existing.cacheHits + (metric.cacheHit ? 1 : 0)
      });
    });

    // Group by level
    const byLevel = new Map<string, LevelMetrics>();
    relevantMetrics.forEach(metric => {
      const existing = byLevel.get(metric.optimizationLevel) || {
        calls: 0,
        avgReduction: 0,
        totalReduction: 0
      };

      byLevel.set(metric.optimizationLevel, {
        calls: existing.calls + 1,
        avgReduction: (existing.avgReduction * existing.calls + metric.reductionPercentage) / (existing.calls + 1),
        totalReduction: existing.totalReduction + (metric.originalSize - metric.optimizedSize)
      });
    });

    return {
      totalCalls: relevantMetrics.length,
      avgReductionPercentage: totalReduction / relevantMetrics.length,
      avgExecutionTime: totalTime / relevantMetrics.length,
      totalOriginalTokens: totalOriginal,
      totalOptimizedTokens: totalOptimized,
      cacheHitRate: (cacheHits / relevantMetrics.length) * 100,
      byOperation,
      byLevel
    };
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operation: string, timeWindow?: number): OperationMetrics | null {
    const aggregated = this.getAggregatedMetrics(timeWindow);
    return aggregated.byOperation.get(operation) || null;
  }

  /**
   * Get top operations by token reduction
   */
  getTopOperationsByReduction(limit: number = 10): Array<{operation: string, metrics: OperationMetrics}> {
    const aggregated = this.getAggregatedMetrics();
    const operations = Array.from(aggregated.byOperation.entries());
    
    return operations
      .sort((a, b) => b[1].avgReduction - a[1].avgReduction)
      .slice(0, limit)
      .map(([operation, metrics]) => ({ operation, metrics }));
  }

  /**
   * Generate performance report
   */
  generateReport(timeWindow?: number): string {
    const metrics = this.getAggregatedMetrics(timeWindow);
    
    if (metrics.totalCalls === 0) {
      return 'No performance metrics available.';
    }

    const report: string[] = [
      '=== Performance Report ===',
      `Total API Calls: ${metrics.totalCalls}`,
      `Average Token Reduction: ${metrics.avgReductionPercentage.toFixed(1)}%`,
      `Total Tokens Saved: ${metrics.totalOriginalTokens - metrics.totalOptimizedTokens}`,
      `Average Execution Time: ${metrics.avgExecutionTime.toFixed(1)}ms`,
      `Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`,
      '',
      '--- Top Operations by Reduction ---'
    ];

    const topOps = this.getTopOperationsByReduction(5);
    topOps.forEach(({ operation, metrics: opMetrics }) => {
      report.push(
        `${operation}: ${opMetrics.avgReduction.toFixed(1)}% reduction ` +
        `(${opMetrics.calls} calls, ${opMetrics.avgTime.toFixed(1)}ms avg)`
      );
    });

    report.push('', '--- Optimization Levels ---');
    metrics.byLevel.forEach((levelMetrics, level) => {
      report.push(
        `${level}: ${levelMetrics.calls} calls, ` +
        `${levelMetrics.avgReduction.toFixed(1)}% avg reduction, ` +
        `${levelMetrics.totalReduction} tokens saved`
      );
    });

    return report.join('\n');
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable metrics collection
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get current metrics count
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();