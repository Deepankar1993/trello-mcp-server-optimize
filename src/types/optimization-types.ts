export type OptimizationLevel = 'minimal' | 'standard' | 'detailed' | 'full';

export interface RuntimeOptimizationConfig {
  // Override optimization level
  level?: OptimizationLevel;
  
  // Custom field selection
  fields?: string[];
  excludeFields?: string[];
  
  // Array handling
  limit?: number;
  offset?: number;
  maxItems?: number;  // Maximum items to return for LIST operations
  summarize?: boolean; // Return summary instead of full data for LIST operations
  
  // Content optimization
  truncateDescriptions?: number; // Truncate long text fields to specified length
  flattenNested?: boolean; // Flatten deeply nested objects
  
  // Response format
  format?: 'optimized' | 'raw';
}

export interface OptimizationGlobalConfig {
  // Default optimization level for all operations
  defaultLevel: OptimizationLevel;
  
  // Enable/disable optimization globally
  enabled: boolean;
  
  // Cache optimized responses
  enableCaching?: boolean;
  cacheTTL?: number; // seconds
  
  // Performance monitoring
  enableMetrics?: boolean;
  metricsEndpoint?: string;
  
  // Field presets location
  presetsPath?: string;
}

export interface FieldSelection {
  include?: string[];    // Whitelist fields
  exclude?: string[];    // Blacklist fields
  expand?: string[];     // Fields to expand (vs summarize)
}

export interface OperationConfig {
  // Operation identifier
  operation: string;
  
  // Default level for this operation
  defaultLevel?: OptimizationLevel;
  
  // Field configurations per level
  fieldPresets?: {
    minimal: FieldSelection;
    standard: FieldSelection;
    detailed: FieldSelection;
  };
  
  // Special handling
  arrayHandling?: {
    maxItems?: number;
    summarize?: boolean;
    fields?: string[]; // Fields to include in summary
  };
}

export interface OptimizationMetrics {
  operation: string;
  timestamp: Date;
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  level: string;
  executionTime: number;
}