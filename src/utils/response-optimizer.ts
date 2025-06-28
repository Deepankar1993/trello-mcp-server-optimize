import { OptimizationLevel, RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { cacheManager, CacheManager } from './cache-manager.js';
import { ResponseSummarizer } from '../services/response-summarizer.js';
import { performanceMonitor } from './performance-monitor.js';
import config from '../config.js';

interface FieldPreset {
  include?: string[];
  exclude?: string[];
}

interface OperationPresets {
  minimal: FieldPreset;
  standard: FieldPreset;
  detailed: FieldPreset;
}

export class ResponseOptimizer {
  private operationPresets: Map<string, OperationPresets> = new Map();
  private globalConfig: {
    enabled: boolean;
    defaultLevel: OptimizationLevel;
    enableCaching: boolean;
    maxResponseSize: number;
    enableSummarization: boolean;
    truncateDescriptions: number;
  };

  constructor() {
    // Initialize from configuration
    this.globalConfig = {
      enabled: config.optimization.enabled,
      defaultLevel: this.getValidOptimizationLevel(config.optimization.defaultLevel),
      enableCaching: config.optimization.enableCaching,
      maxResponseSize: config.optimization.maxResponseSize,
      enableSummarization: config.optimization.enableSummarization,
      truncateDescriptions: config.optimization.truncateDescriptions
    };
    
    this.initializePresets();
  }

  private initializePresets(): void {
    // get_cards_in_list presets - targeting 85% reduction from 2,103 tokens
    this.operationPresets.set('get_cards_in_list', {
      minimal: {
        include: ['id', 'name', 'idList', 'closed', 'pos']
      },
      standard: {
        include: ['id', 'name', 'desc', 'idList', 'closed', 'pos', 'due', 'dueComplete', 'labels', 'idMembers', 'shortUrl']
      },
      detailed: {
        exclude: ['badges', 'cover', 'attachments', 'descData', 'limits', 'checkItemStates', 'pluginData', 'customFieldItems']
      }
    });

    // get_board presets - targeting 85% reduction from 1,262 tokens
    this.operationPresets.set('get_board', {
      minimal: {
        include: ['id', 'name', 'closed', 'url', 'shortUrl']
      },
      standard: {
        include: ['id', 'name', 'desc', 'descData', 'closed', 'idOrganization', 'url', 'shortUrl', 'shortLink', 'dateLastActivity', 'dateLastView']
      },
      detailed: {
        exclude: ['prefs', 'labelNames', 'backgroundImageScaled', 'limits', 'powerUps', 'premiumFeatures', 'templateGallery', 'ixUpdate', 'nodeId', 'switcherViews']
      }
    });

    // get_boards presets - for board lists
    this.operationPresets.set('get_boards', {
      minimal: {
        include: ['id', 'name', 'closed']
      },
      standard: {
        include: ['id', 'name', 'desc', 'closed', 'idOrganization', 'dateLastActivity']
      },
      detailed: {
        exclude: ['prefs', 'labelNames', 'limits', 'memberships']
      }
    });

    // get_card presets - targeting 85% reduction from 649 tokens
    this.operationPresets.set('get_card', {
      minimal: {
        include: ['id', 'name', 'desc', 'idList', 'idBoard', 'closed', 'due', 'dueComplete']
      },
      standard: {
        include: ['id', 'name', 'desc', 'idList', 'idBoard', 'closed', 'due', 'dueComplete', 'labels', 'idMembers', 'idChecklists', 'shortUrl', 'pos', 'dateLastActivity']
      },
      detailed: {
        exclude: ['badges', 'cover', 'attachments', 'descData', 'limits', 'checkItemStates', 'pluginData', 'customFieldItems']
      }
    });

    // get_comments presets - targeting 85% reduction from 614 tokens
    this.operationPresets.set('get_comments', {
      minimal: {
        include: ['id', 'data', 'date', 'idMemberCreator']
      },
      standard: {
        include: ['id', 'data', 'date', 'idMemberCreator', 'type', 'memberCreator']
      },
      detailed: {
        exclude: ['limits', 'display', 'entities', 'appCreator']
      }
    });

    // get_board_lists presets - targeting 85% reduction from 551 tokens
    this.operationPresets.set('get_board_lists', {
      minimal: {
        include: ['id', 'name', 'closed', 'idBoard', 'pos']
      },
      standard: {
        include: ['id', 'name', 'closed', 'idBoard', 'pos', 'subscribed']
      },
      detailed: {
        exclude: ['limits', 'softLimit']
      }
    });

    // Additional presets for other operations
    this.operationPresets.set('get_me', {
      minimal: {
        include: ['id', 'username', 'fullName', 'email']
      },
      standard: {
        include: ['id', 'username', 'fullName', 'email', 'initials', 'memberType', 'confirmed']
      },
      detailed: {
        exclude: ['avatarHash', 'avatarUrl', 'avatarSource', 'gravatarHash', 'uploadedAvatarHash', 'uploadedAvatarUrl', 'prefs', 'limits', 'marketingOptIn', 'messagesDismissed', 'oneTimeMessagesDismissed']
      }
    });

    this.operationPresets.set('get_member', {
      minimal: {
        include: ['id', 'username', 'fullName']
      },
      standard: {
        include: ['id', 'username', 'fullName', 'initials', 'memberType']
      },
      detailed: {
        exclude: ['avatarHash', 'avatarUrl', 'avatarSource', 'gravatarHash', 'uploadedAvatarHash', 'uploadedAvatarUrl', 'prefs', 'limits']
      }
    });

    this.operationPresets.set('get_list', {
      minimal: {
        include: ['id', 'name', 'closed', 'idBoard', 'pos']
      },
      standard: {
        include: ['id', 'name', 'closed', 'idBoard', 'pos', 'subscribed']
      },
      detailed: {
        exclude: ['limits', 'softLimit']
      }
    });

    this.operationPresets.set('get_member_boards', {
      minimal: {
        include: ['id', 'name', 'closed', 'url']
      },
      standard: {
        include: ['id', 'name', 'desc', 'closed', 'url', 'shortUrl', 'starred', 'memberships']
      },
      detailed: {
        exclude: ['prefs', 'labelNames', 'limits', 'powerUps', 'premiumFeatures']
      }
    });
  }

  /**
   * Optimize a response with caching support
   */
  async optimizeWithCache<T>(
    operation: string,
    params: any,
    dataFetcher: () => Promise<T>,
    runtimeConfig?: RuntimeOptimizationConfig
  ): Promise<T> {
    // Check if caching is enabled and operation is cacheable
    if (this.globalConfig.enableCaching && CacheManager.shouldCache(operation)) {
      // Try to get from cache
      const cached = cacheManager.get(operation, params, runtimeConfig);
      if (cached !== null) {
        // Record cache hit metric
        performanceMonitor.recordMetric(
          operation,
          cached, // Use cached as both original and optimized
          cached,
          'cache',
          Date.now(),
          true
        );
        return cached;
      }
    }
    
    // Fetch fresh data
    const data = await dataFetcher();
    
    // Optimize the data
    const optimized = this.optimize(data, operation, runtimeConfig);
    
    // Cache the optimized result if applicable
    if (this.globalConfig.enableCaching && CacheManager.shouldCache(operation)) {
      const ttl = CacheManager.getTTLForOperation(operation);
      cacheManager.set(operation, params, optimized, runtimeConfig, ttl);
    }
    
    return optimized;
  }

  /**
   * Optimize a response based on the operation and configuration
   */
  optimize<T>(
    data: T,
    operation: string,
    runtimeConfig?: RuntimeOptimizationConfig
  ): T {
    const startTime = Date.now();
    const originalData = data;
    
    // If optimization is disabled globally, return original data
    if (!this.globalConfig.enabled && !runtimeConfig?.level) {
      return data;
    }

    // Determine optimization level
    const level = runtimeConfig?.level || this.globalConfig.defaultLevel;
    
    // Full level returns unmodified data
    if (level === 'full') {
      return data;
    }

    // Get presets for this operation
    const presets = this.operationPresets.get(operation);
    if (!presets) {
      // No presets defined, return original data
      return data;
    }

    // Apply optimization based on level
    const preset = presets[level];
    
    // Handle array-specific optimizations first (pagination, limiting, summarization)
    if (Array.isArray(data) && runtimeConfig) {
      let result = data as any[];
      
      // Apply pagination/limiting
      if (runtimeConfig.maxItems && runtimeConfig.maxItems > 0) {
        result = result.slice(0, runtimeConfig.maxItems);
      }
      
      // Apply summarization
      if (runtimeConfig.summarize || 
          (this.globalConfig.enableSummarization && 
           this.shouldAutoSummarize(result))) {
        return this.summarizeArray(result, operation) as unknown as T;
      }
      
      // Continue with field filtering on the limited array
      data = result as unknown as T;
    }
    
    // Handle custom field selection from runtime config
    if (runtimeConfig?.fields) {
      return this.filterFields(data, { include: runtimeConfig.fields });
    }

    // Apply preset filtering
    let filtered = this.filterFields(data, preset);
    
    // Apply content truncation if requested
    if (runtimeConfig?.truncateDescriptions) {
      filtered = this.applyContentTruncation(filtered, runtimeConfig.truncateDescriptions);
    }
    
    // Record performance metric
    performanceMonitor.recordMetric(
      operation,
      originalData,
      filtered,
      level,
      startTime,
      false
    );
    
    return filtered;
  }

  /**
   * Summarize an array response using the ResponseSummarizer
   */
  private summarizeArray(data: any[], operation: string): any {
    const entityType = ResponseSummarizer.getEntityType(operation);
    return ResponseSummarizer.createSummaryResponse(data, entityType, {
      includeStats: true,
      maxSampleItems: 5,
      truncateDescriptions: 100,
      flattenNested: false
    });
  }

  /**
   * Apply content truncation to descriptions and other long text fields
   */
  private applyContentTruncation<T>(data: T, maxLength: number): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.applyContentTruncation(item, maxLength)) as unknown as T;
    }

    // Handle objects
    const result: any = {};
    
    for (const [key, value] of Object.entries(data as any)) {
      if (typeof value === 'string' && (key === 'desc' || key === 'description')) {
        const truncated = ResponseSummarizer.truncateContent(value, maxLength);
        if (truncated.isTruncated) {
          result[key] = truncated.truncated;
          result[`${key}OriginalLength`] = truncated.originalLength;
        } else {
          result[key] = value;
        }
      } else if (value && typeof value === 'object') {
        // Recursively handle nested objects
        result[key] = this.applyContentTruncation(value, maxLength);
      } else {
        result[key] = value;
      }
    }
    
    return result as T;
  }

  /**
   * Filter fields based on include/exclude lists
   */
  private filterFields<T>(data: T, preset: FieldPreset): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.filterFields(item, preset)) as unknown as T;
    }

    // Handle objects
    const result: any = {};
    const dataObj = data as any;

    if (preset.include) {
      // Whitelist mode - only include specified fields
      for (const field of preset.include) {
        if (field in dataObj) {
          result[field] = dataObj[field];
        }
      }
    } else if (preset.exclude) {
      // Blacklist mode - include all except specified fields
      for (const [key, value] of Object.entries(dataObj)) {
        if (!preset.exclude.includes(key)) {
          result[key] = value;
        }
      }
    } else {
      // No filtering
      return data;
    }

    return result;
  }

  /**
   * Invalidate cache for write operations
   */
  invalidateCache(operation: string, params?: any): void {
    if (!this.globalConfig.enableCaching) {
      return;
    }
    
    // Map write operations to related read operations
    const invalidationMap: Record<string, string[]> = {
      // Board operations
      'create_board': ['get_boards'],
      'update_board': ['get_board', 'get_boards'],
      'delete_board': ['get_board', 'get_boards'],
      'close_board': ['get_board', 'get_boards'],
      'reopen_board': ['get_board', 'get_boards'],
      
      // List operations
      'create_list': ['get_board_lists', 'get_list'],
      'update_list': ['get_list', 'get_board_lists'],
      'archive_list': ['get_list', 'get_board_lists'],
      'unarchive_list': ['get_list', 'get_board_lists'],
      'move_list_to_board': ['get_board_lists'],
      
      // Card operations
      'create_card': ['get_cards_in_list', 'get_card'],
      'update_card': ['get_card', 'get_cards_in_list'],
      'delete_card': ['get_card', 'get_cards_in_list'],
      'archive_card': ['get_card', 'get_cards_in_list'],
      'unarchive_card': ['get_card', 'get_cards_in_list'],
      'move_card_to_list': ['get_card', 'get_cards_in_list'],
      
      // Comment operations
      'add_comment': ['get_comments'],
      
      // Member operations
      'add_member': ['get_card_members', 'get_board_members'],
      'remove_member': ['get_card_members', 'get_board_members'],
      
      // Label operations
      'create_label': ['get_board_labels', 'get_label'],
      'update_label': ['get_label', 'get_board_labels'],
      'delete_label': ['get_label', 'get_board_labels'],
      'add_label': ['get_card_labels'],
      'remove_label': ['get_card_labels'],
      
      // Checklist operations
      'create_checklist': ['get_checklist'],
      'update_checklist': ['get_checklist'],
      'delete_checklist': ['get_checklist'],
      'create_checkitem': ['get_checkitems', 'get_checkitem'],
      'update_checkitem': ['get_checkitem', 'get_checkitems'],
      'delete_checkitem': ['get_checkitem', 'get_checkitems']
    };
    
    const operationsToInvalidate = invalidationMap[operation] || [];
    operationsToInvalidate.forEach(op => {
      cacheManager.invalidateByOperation(op);
    });
  }

  /**
   * Get optimization statistics for monitoring
   */
  getOptimizationStats(
    originalData: any,
    optimizedData: any,
    operation: string
  ): {
    originalSize: number;
    optimizedSize: number;
    reductionPercentage: number;
    estimatedTokenReduction: number;
  } {
    const originalSize = JSON.stringify(originalData).length;
    const optimizedSize = JSON.stringify(optimizedData).length;
    const reductionPercentage = Math.round((1 - optimizedSize / originalSize) * 100);
    
    // Estimate token reduction based on character count
    // Rough estimate: 1 token ≈ 4 characters
    const estimatedTokenReduction = Math.round((originalSize - optimizedSize) / 4);

    return {
      originalSize,
      optimizedSize,
      reductionPercentage,
      estimatedTokenReduction
    };
  }

  /**
   * Set global optimization state
   */
  setEnabled(enabled: boolean): void {
    this.globalConfig.enabled = enabled;
  }

  /**
   * Set default optimization level
   */
  setDefaultLevel(level: OptimizationLevel): void {
    this.globalConfig.defaultLevel = level;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      ...this.globalConfig,
      operations: Array.from(this.operationPresets.keys())
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      ...cacheManager.getStats(),
      hitRate: cacheManager.getHitRate()
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    cacheManager.clear();
  }

  /**
   * Enable or disable caching
   */
  setCachingEnabled(enabled: boolean): void {
    this.globalConfig.enableCaching = enabled;
  }

  /**
   * Check if array should be auto-summarized based on size
   */
  private shouldAutoSummarize(data: any[]): boolean {
    // Estimate response size
    const estimatedSize = JSON.stringify(data).length;
    return estimatedSize > this.globalConfig.maxResponseSize;
  }

  /**
   * Get valid optimization level from config value
   */
  private getValidOptimizationLevel(level: string): OptimizationLevel {
    if (level === 'smart') {
      return 'standard'; // Default smart mapping
    }
    const validLevels: OptimizationLevel[] = ['minimal', 'standard', 'detailed', 'full'];
    return validLevels.includes(level as OptimizationLevel) 
      ? level as OptimizationLevel 
      : 'standard';
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeWindow?: number) {
    return performanceMonitor.getAggregatedMetrics(timeWindow);
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(timeWindow?: number): string {
    return performanceMonitor.generateReport(timeWindow);
  }
}

// Singleton instance
export const responseOptimizer = new ResponseOptimizer();