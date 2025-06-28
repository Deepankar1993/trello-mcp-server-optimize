# MCP Response Filtering Patterns Research

## Overview
Research findings on how MCP servers handle response filtering and data optimization, with recommendations for the Trello MCP server.

## Key Findings

### 1. Current State of MCP Protocol
- **Text-Oriented**: MCP is designed for free-form text responses, not structured data filtering
- **Human-Readable**: Responses optimized for human consumption, not token efficiency
- **Evolving Standard**: Community actively discussing structured response formats

### 2. Common Optimization Patterns

#### Transport-Level Optimizations
- Different response formats based on transport (JSON vs SSE)
- Session-based optimizations using headers
- Connection pooling for performance

#### Field Selection Strategies
1. **Whitelist Approach**: Only include requested fields
2. **Blacklist Approach**: Exclude known large fields
3. **Preset Levels**: minimal/standard/detailed/full
4. **Dynamic Selection**: Client-specified fields

#### Response Transformation
- Remove redundant nested objects
- Flatten complex structures
- Summarize arrays
- Strip metadata unless requested

## Recommended Implementation Pattern

### 1. Response Optimizer Service
```typescript
interface OptimizationConfig {
  level: 'minimal' | 'standard' | 'detailed' | 'full';
  fields?: string[];         // Include only these fields
  excludeFields?: string[];   // Exclude these fields
  maxItems?: number;         // Limit array sizes
  summarize?: boolean;       // Summarize nested data
}

class ResponseOptimizer {
  private fieldMappings: Map<string, FieldConfig>;
  
  optimize<T>(data: T, config: OptimizationConfig): T {
    // Apply optimization based on config
  }
}
```

### 2. Service Layer Integration
```typescript
// In BaseService
protected async makeRequest(
  path: string, 
  options?: RequestOptions,
  optimization?: OptimizationConfig
): Promise<any> {
  const response = await this.request(path, options);
  return this.optimizer.optimize(response, optimization);
}
```

### 3. Tool Handler Pattern
```typescript
// In tool handlers
export async function getBoardHandler(args: GetBoardArgs): Promise<Board> {
  const optimization: OptimizationConfig = {
    level: args.detailLevel || 'standard',
    excludeFields: ['prefs', 'backgroundImageScaled', 'limits']
  };
  
  return boardService.getBoard(args.boardId, optimization);
}
```

## Field Optimization Presets

### Minimal Level (80-90% reduction)
- Only essential identifiers and names
- No metadata, preferences, or formatting
- Suitable for list operations

### Standard Level (60-70% reduction)
- Core functional fields
- Basic relationships (IDs)
- No preferences or UI-specific data
- Default for most operations

### Detailed Level (30-40% reduction)
- All functional fields
- Includes some metadata
- Excludes only redundant data
- For detailed views

### Full Level (0% reduction)
- Complete response
- Backward compatibility
- Debugging and development

## Specific Field Mappings

### Board Fields
```javascript
const boardFieldPresets = {
  minimal: ['id', 'name', 'closed', 'url'],
  standard: ['id', 'name', 'desc', 'closed', 'url', 'shortUrl', 'idOrganization'],
  detailed: ['*', '-prefs', '-backgroundImageScaled', '-limits'],
  full: ['*']
};
```

### Card Fields
```javascript
const cardFieldPresets = {
  minimal: ['id', 'name', 'idList', 'pos'],
  standard: ['id', 'name', 'desc', 'due', 'idList', 'idBoard', 'labels', 'idMembers'],
  detailed: ['*', '-badges', '-cover.idUploadedBackground', '-limits'],
  full: ['*']
};
```

## Implementation Recommendations

### Phase 1: Basic Filtering (Week 1)
1. Implement ResponseOptimizer class
2. Add optimization config to tool schemas
3. Apply preset levels to top 5 operations
4. Test token reduction metrics

### Phase 2: Advanced Features (Week 2)
1. Dynamic field selection
2. Array summarization
3. Response caching
4. Performance monitoring

### Phase 3: Production Ready (Week 3)
1. Configuration file support
2. Per-client preferences
3. Comprehensive testing
4. Documentation

## Best Practices

1. **Progressive Disclosure**: Start minimal, allow expansion
2. **Smart Defaults**: Different defaults for different operation types
3. **Backward Compatibility**: Always support 'full' mode
4. **Clear Documentation**: Document available fields per level
5. **Performance Monitoring**: Track optimization effectiveness

## Expected Outcomes

- **Minimal Level**: 85-90% token reduction
- **Standard Level**: 60-70% token reduction
- **Detailed Level**: 30-40% token reduction
- **Average Savings**: 70% across typical usage patterns

## Next Steps

1. Design configuration schema
2. Implement ResponseOptimizer class
3. Update tool schemas with optimization parameters
4. Create field mapping configurations
5. Test with real Trello data