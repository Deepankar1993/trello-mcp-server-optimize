# Optimization Configuration System Design

## Overview
A flexible, extensible configuration system for the Trello MCP server that enables token optimization while maintaining backward compatibility and ease of use.

## Configuration Schema

### 1. Global Configuration
```typescript
interface OptimizationGlobalConfig {
  // Default optimization level for all operations
  defaultLevel: 'minimal' | 'standard' | 'detailed' | 'full';
  
  // Enable/disable optimization globally
  enabled: boolean;
  
  // Cache optimized responses
  enableCaching: boolean;
  cacheTTL: number; // seconds
  
  // Performance monitoring
  enableMetrics: boolean;
  metricsEndpoint?: string;
  
  // Field presets location
  presetsPath: string;
}
```

### 2. Operation-Specific Configuration
```typescript
interface OperationConfig {
  // Operation identifier
  operation: string; // e.g., 'get_board', 'get_cards_in_list'
  
  // Default level for this operation
  defaultLevel?: 'minimal' | 'standard' | 'detailed' | 'full';
  
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

interface FieldSelection {
  include?: string[];    // Whitelist fields
  exclude?: string[];    // Blacklist fields
  expand?: string[];     // Fields to expand (vs summarize)
}
```

### 3. Runtime Configuration
```typescript
interface RuntimeOptimizationConfig {
  // Override for specific request
  level?: 'minimal' | 'standard' | 'detailed' | 'full';
  
  // Custom field selection
  fields?: string[];
  excludeFields?: string[];
  
  // Array handling
  limit?: number;
  offset?: number;
  
  // Response format
  format?: 'optimized' | 'raw';
}
```

## Configuration Files

### 1. Main Configuration File (`optimization.config.json`)
```json
{
  "global": {
    "defaultLevel": "standard",
    "enabled": true,
    "enableCaching": true,
    "cacheTTL": 300,
    "enableMetrics": true,
    "presetsPath": "./optimization-presets"
  },
  "operations": {
    "get_board": {
      "defaultLevel": "standard"
    },
    "get_cards_in_list": {
      "defaultLevel": "minimal",
      "arrayHandling": {
        "maxItems": 50,
        "summarize": true
      }
    },
    "get_card": {
      "defaultLevel": "detailed"
    }
  }
}
```

### 2. Field Presets (`optimization-presets/board.json`)
```json
{
  "entity": "board",
  "presets": {
    "minimal": {
      "include": ["id", "name", "closed", "url", "shortUrl"]
    },
    "standard": {
      "include": [
        "id", "name", "desc", "descData", "closed", "idOrganization",
        "url", "shortUrl", "shortLink", "dateLastActivity"
      ]
    },
    "detailed": {
      "exclude": [
        "prefs", "backgroundImageScaled", "limits", "templateGallery",
        "premiumFeatures", "ixUpdate", "nodeId", "switcherViews"
      ]
    }
  },
  "fieldMappings": {
    "prefs": {
      "tokenImpact": "high",
      "importance": "low",
      "size": 500
    },
    "backgroundImageScaled": {
      "tokenImpact": "medium",
      "importance": "low",
      "size": 200
    }
  }
}
```

### 3. User Preferences (`.trello-mcp/preferences.json`)
```json
{
  "userId": "user123",
  "preferences": {
    "defaultLevel": "standard",
    "favoriteFields": {
      "board": ["name", "desc", "url"],
      "card": ["name", "desc", "due", "labels"]
    },
    "alwaysExclude": ["nodeId", "limits", "templateGallery"]
  }
}
```

## Implementation Architecture

### 1. Configuration Loader
```typescript
class ConfigurationLoader {
  private globalConfig: OptimizationGlobalConfig;
  private operationConfigs: Map<string, OperationConfig>;
  private fieldPresets: Map<string, EntityFieldPresets>;
  
  async load(): Promise<void> {
    // Load main config
    this.globalConfig = await this.loadGlobalConfig();
    
    // Load operation-specific configs
    this.operationConfigs = await this.loadOperationConfigs();
    
    // Load field presets
    this.fieldPresets = await this.loadFieldPresets();
  }
  
  getConfig(operation: string): CompleteOperationConfig {
    // Merge global, operation, and preset configs
  }
}
```

### 2. Response Optimizer
```typescript
class ResponseOptimizer {
  constructor(private config: ConfigurationLoader) {}
  
  optimize<T>(
    data: T,
    operation: string,
    runtimeConfig?: RuntimeOptimizationConfig
  ): T {
    // Get merged configuration
    const config = this.getMergedConfig(operation, runtimeConfig);
    
    // Apply optimization
    return this.applyOptimization(data, config);
  }
  
  private applyOptimization(data: any, config: MergedConfig): any {
    // Field filtering
    if (config.fields.include) {
      data = this.includeFields(data, config.fields.include);
    }
    
    if (config.fields.exclude) {
      data = this.excludeFields(data, config.fields.exclude);
    }
    
    // Array handling
    if (Array.isArray(data) && config.arrayHandling) {
      data = this.optimizeArray(data, config.arrayHandling);
    }
    
    return data;
  }
}
```

### 3. Tool Integration
```typescript
// Updated tool schema
const getBoardTool = {
  name: "get_board",
  description: "Retrieve board information",
  inputSchema: {
    type: "object",
    properties: {
      boardId: { type: "string", description: "Board ID" },
      // New optimization parameters
      detailLevel: {
        type: "string",
        enum: ["minimal", "standard", "detailed", "full"],
        description: "Level of detail in response (default: standard)"
      },
      fields: {
        type: "array",
        items: { type: "string" },
        description: "Specific fields to include"
      },
      excludeFields: {
        type: "array",
        items: { type: "string" },
        description: "Fields to exclude from response"
      }
    },
    required: ["boardId"]
  }
};
```

### 4. Service Layer Updates
```typescript
class BoardService extends BaseService {
  async getBoard(
    boardId: string,
    optimization?: RuntimeOptimizationConfig
  ): Promise<Board> {
    const response = await this.makeRequest(`boards/${boardId}`);
    
    // Apply optimization if enabled
    if (this.config.global.enabled) {
      return this.optimizer.optimize(response, 'get_board', optimization);
    }
    
    return response;
  }
}
```

## Configuration Management

### 1. Environment Variables
```bash
# Override configuration file paths
TRELLO_MCP_CONFIG_PATH=/custom/path/optimization.config.json
TRELLO_MCP_PRESETS_PATH=/custom/path/presets

# Override global settings
TRELLO_MCP_DEFAULT_LEVEL=minimal
TRELLO_MCP_OPTIMIZATION_ENABLED=true
TRELLO_MCP_CACHE_ENABLED=false
```

### 2. Command Line Arguments
```bash
# Start server with custom config
npm start -- --config=/path/to/config.json --level=minimal

# Disable optimization
npm start -- --no-optimization

# Enable debug mode
npm start -- --debug-optimization
```

### 3. Dynamic Configuration Updates
```typescript
// API endpoint for configuration updates
app.post('/optimization/config', (req, res) => {
  const updates = req.body;
  configLoader.updateConfig(updates);
  res.json({ success: true });
});

// Watch config files for changes
configLoader.watchForChanges((event) => {
  console.log('Configuration updated:', event);
  configLoader.reload();
});
```

## Usage Examples

### 1. Basic Usage (Default Optimization)
```typescript
// Uses default 'standard' level
const board = await trelloService.getBoard('boardId');
```

### 2. Custom Level
```typescript
// Use minimal fields
const board = await trelloService.getBoard('boardId', {
  level: 'minimal'
});
```

### 3. Custom Fields
```typescript
// Specific fields only
const board = await trelloService.getBoard('boardId', {
  fields: ['id', 'name', 'desc', 'url']
});
```

### 4. Exclude Specific Fields
```typescript
// Full response minus specific fields
const board = await trelloService.getBoard('boardId', {
  level: 'full',
  excludeFields: ['prefs', 'limits']
});
```

## Migration Strategy

### Phase 1: Soft Launch
1. Optimization disabled by default
2. Opt-in via environment variable
3. Monitor performance and token savings

### Phase 2: Gradual Rollout
1. Enable for specific operations
2. Default to 'full' level
3. Collect user feedback

### Phase 3: Full Deployment
1. Enable optimization by default
2. Set appropriate default levels
3. Provide migration guide

## Monitoring and Metrics

### 1. Token Usage Metrics
```typescript
interface OptimizationMetrics {
  operation: string;
  timestamp: Date;
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  level: string;
  executionTime: number;
}
```

### 2. Performance Dashboard
- Real-time token savings
- Operation-level analytics
- User preference patterns
- Cache hit rates

### 3. Alerts
- Token usage spikes
- Optimization failures
- Cache performance issues
- Configuration errors

## Documentation

### 1. User Guide
- Configuration options
- Optimization levels explained
- Field selection syntax
- Migration guide

### 2. API Reference
- Tool parameter updates
- Response format changes
- Field availability per level

### 3. Best Practices
- Choosing optimization levels
- Custom field selection
- Performance tuning
- Troubleshooting

## Next Steps

1. Implement ConfigurationLoader class
2. Create ResponseOptimizer service
3. Update tool schemas with optimization parameters
4. Create field preset files
5. Implement caching layer
6. Add monitoring and metrics
7. Write comprehensive documentation
8. Create migration tools