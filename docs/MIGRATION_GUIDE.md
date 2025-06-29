# Trello MCP Server Migration Guide

## Table of Contents
- [Overview](#overview)
- [Migration from v0.x to v1.0](#migration-from-v0x-to-v10)
- [Adopting Optimization Features](#adopting-optimization-features)
- [Configuration Changes](#configuration-changes)
- [API Changes](#api-changes)
- [Testing Your Migration](#testing-your-migration)
- [Rollback Strategy](#rollback-strategy)
- [Best Practices](#best-practices)

## Overview

This guide helps existing users migrate to the optimized Trello MCP Server v1.0, which includes:
- 70-80% token usage reduction
- Operation-specific optimization
- Enhanced performance monitoring
- Improved error handling

### Benefits of Upgrading
- **Cost Savings**: Dramatically reduced AI API token usage
- **Performance**: Faster response processing
- **Flexibility**: Granular control over response data
- **Monitoring**: Built-in performance tracking

## Migration from v0.x to v1.0

### Breaking Changes

#### 1. Response Structure
**Old (v0.x)**: Full Trello API responses
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Board",
  "desc": "Board description",
  "descData": null,
  "closed": false,
  "idOrganization": "507f1f77bcf86cd799439012",
  "idEnterprise": null,
  "pinned": false,
  "url": "https://trello.com/b/abcd1234",
  "shortUrl": "https://trello.com/b/abcd1234",
  "prefs": { /* 20+ preference fields */ },
  "labelNames": { /* label configuration */ },
  // ... 50+ more fields
}
```

**New (v1.0)**: Optimized responses by default
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Board",
  "desc": "Board description",
  "closed": false,
  "url": "https://trello.com/b/abcd1234",
  "dateLastActivity": "2023-12-15T10:30:00.000Z"
}
```

#### 2. Tool Parameters
New optional parameters for all read operations:
- `optimizationLevel`: Control response detail
- `fields`: Specify exact fields needed

#### 3. Configuration
New environment variables:
- `OPTIMIZATION_LEVEL`: Default optimization level
- `PERFORMANCE_MONITORING`: Enable metrics
- `CACHE_ENABLED`: Future caching support

### Step-by-Step Migration

#### Step 1: Update Dependencies
```bash
# Backup current version
npm list trello-mcp-server > version-backup.txt

# Update to v1.0
npm update trello-mcp-server@^1.0.0

# Or for source installations
git pull origin main
npm install
npm run build
```

#### Step 2: Update Configuration
Add to your `.env`:
```bash
# Existing
TRELLO_API_KEY=your_key
TRELLO_TOKEN=your_token

# New in v1.0
OPTIMIZATION_LEVEL=standard  # Start with standard
PERFORMANCE_MONITORING=true
```

#### Step 3: Test Critical Workflows
Test your most important operations:
```javascript
// Test board operations
const boards = await trello.get_boards({
  filter: "open",
  optimizationLevel: "full"  // Use full initially
});

// Verify you have all needed fields
console.log("Board fields:", Object.keys(boards[0]));
```

#### Step 4: Gradually Enable Optimization
Start with least aggressive optimization:
```javascript
// Phase 1: Detailed (40% reduction)
{
  "optimizationLevel": "detailed"
}

// Phase 2: Standard (70% reduction)
{
  "optimizationLevel": "standard"
}

// Phase 3: Minimal (80% reduction)
{
  "optimizationLevel": "minimal"
}
```

## Adopting Optimization Features

### Understanding Optimization Levels

#### When to Use Each Level

**Minimal** - Best for:
- Listing operations
- ID lookups
- Bulk operations
- Navigation/selection

**Standard** - Best for:
- General CRUD operations
- Status displays
- Most common workflows
- Default choice

**Detailed** - Best for:
- Complex operations
- Full context needed
- Debugging
- Data analysis

**Full** - Best for:
- Data export
- Compatibility mode
- Troubleshooting
- Baseline comparison

### Implementing Field Selection

#### Basic Field Selection
```javascript
// Old approach - gets everything
const card = await trello.get_card({ cardId: "123" });

// New approach - get only what you need
const card = await trello.get_card({
  cardId: "123",
  fields: ["name", "desc", "due", "idMembers"]
});
```

#### Nested Field Selection
```javascript
// Get specific nested fields
const board = await trello.get_board({
  boardId: "456",
  fields: [
    "name",
    "prefs.permissionLevel",
    "prefs.background",
    "labelNames.green",
    "memberships[*].idMember"
  ]
});
```

### Operation-Specific Optimization

#### Configure by Operation Type
Create `optimization-config.json`:
```json
{
  "overrides": {
    "get_boards": "minimal",
    "get_board": "standard", 
    "get_card": "detailed",
    "get_comments": "minimal"
  }
}
```

#### Custom Presets
Define operation-specific presets:
```json
{
  "presets": {
    "board_overview": {
      "level": "custom",
      "fields": ["id", "name", "closed", "dateLastActivity", "prefs.background"]
    },
    "card_edit": {
      "level": "custom",
      "fields": ["id", "name", "desc", "due", "idList", "idMembers", "idLabels"]
    }
  }
}
```

## Configuration Changes

### Environment Variable Migration

#### Old Configuration
```bash
TRELLO_API_KEY=key
TRELLO_TOKEN=token
DEBUG=true
```

#### New Configuration
```bash
# Required (unchanged)
TRELLO_API_KEY=key
TRELLO_TOKEN=token

# New optimization settings
OPTIMIZATION_LEVEL=standard
CACHE_ENABLED=false
PERFORMANCE_MONITORING=true

# Updated logging
LOG_LEVEL=info  # Replaces DEBUG
LOG_FILE=./logs/trello-mcp.log
```

### Configuration File Changes

#### Old: Simple Config
```json
{
  "trello": {
    "apiKey": "key",
    "token": "token"
  }
}
```

#### New: Extended Config
```json
{
  "server": {
    "name": "trello-mcp-server",
    "version": "1.0.0"
  },
  "trello": {
    "apiUrl": "https://api.trello.com/1",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "optimization": {
    "defaultLevel": "standard",
    "enforceOptimization": true,
    "customLevels": {}
  },
  "monitoring": {
    "performance": true,
    "tokenUsage": true
  }
}
```

## API Changes

### Backward Compatibility

#### Full Compatibility Mode
```javascript
// Force old behavior
process.env.OPTIMIZATION_LEVEL = "full";

// Or per-request
const board = await trello.get_board({
  boardId: "123",
  optimizationLevel: "full"
});
```

#### Gradual Migration
```javascript
// Wrapper for gradual migration
function migrateGetBoard(params) {
  // Start with full, monitor, then optimize
  const level = process.env.MIGRATION_PHASE || "full";
  return trello.get_board({
    ...params,
    optimizationLevel: level
  });
}
```

### New Features to Adopt

#### Performance Monitoring
```javascript
// Enable monitoring
process.env.PERFORMANCE_MONITORING = "true";

// Access metrics
const metrics = await trello.get_performance_metrics();
console.log(`Average response time: ${metrics.avgResponseTime}ms`);
console.log(`Token reduction: ${metrics.tokenReduction}%`);
```

#### Field Discovery
```javascript
// Discover available fields
const fullCard = await trello.get_card({
  cardId: "123",
  optimizationLevel: "full"
});

console.log("Available fields:", Object.keys(fullCard));
```

## Testing Your Migration

### Test Suite
Create comprehensive tests:

```javascript
// test-migration.js
const assert = require('assert');

async function testBoardOperations() {
  // Test 1: Minimal optimization
  const minimalBoards = await trello.get_boards({
    optimizationLevel: "minimal"
  });
  assert(minimalBoards[0].id, "Should have ID");
  assert(minimalBoards[0].name, "Should have name");
  
  // Test 2: Field selection
  const customBoard = await trello.get_board({
    boardId: minimalBoards[0].id,
    fields: ["name", "desc", "prefs"]
  });
  assert(customBoard.prefs, "Should have prefs");
  assert(!customBoard.memberships, "Should not have memberships");
  
  console.log("✓ Board operations working");
}

async function testCardOperations() {
  // Similar tests for cards
}

// Run all tests
Promise.all([
  testBoardOperations(),
  testCardOperations(),
  // Add more test functions
]).then(() => {
  console.log("✅ All migration tests passed");
}).catch(error => {
  console.error("❌ Migration test failed:", error);
  process.exit(1);
});
```

### Performance Comparison
```javascript
// Measure token savings
async function comparePerformance() {
  // Measure full response
  const start1 = Date.now();
  const fullData = await trello.get_boards({
    optimizationLevel: "full"
  });
  const fullSize = JSON.stringify(fullData).length;
  const fullTime = Date.now() - start1;
  
  // Measure optimized response
  const start2 = Date.now();
  const optimizedData = await trello.get_boards({
    optimizationLevel: "minimal"
  });
  const optimizedSize = JSON.stringify(optimizedData).length;
  const optimizedTime = Date.now() - start2;
  
  console.log(`Full response: ${fullSize} bytes in ${fullTime}ms`);
  console.log(`Optimized response: ${optimizedSize} bytes in ${optimizedTime}ms`);
  console.log(`Reduction: ${Math.round((1 - optimizedSize/fullSize) * 100)}%`);
}
```

## Rollback Strategy

### Quick Rollback
If issues occur, immediately revert:

```bash
# Set environment variable
export OPTIMIZATION_LEVEL=full

# Or in code
process.env.OPTIMIZATION_LEVEL = "full";
```

### Partial Rollback
Rollback specific operations:

```javascript
const ROLLBACK_OPERATIONS = ["get_card", "update_card"];

// Wrapper to force full responses for specific operations
function wrapTrelloCall(operation, params) {
  if (ROLLBACK_OPERATIONS.includes(operation)) {
    params.optimizationLevel = "full";
  }
  return trello[operation](params);
}
```

### Version Rollback
If needed, revert to previous version:

```bash
# Check previous version
cat version-backup.txt

# Revert to specific version
npm install trello-mcp-server@0.9.0
```

## Best Practices

### 1. Monitor Token Usage
```javascript
// Track token usage reduction
let totalSaved = 0;
let totalRequests = 0;

// Wrapper to track savings
async function trackedCall(operation, params) {
  const fullSize = await getFullResponseSize(operation, params);
  const result = await trello[operation](params);
  const optimizedSize = JSON.stringify(result).length;
  
  totalSaved += (fullSize - optimizedSize);
  totalRequests++;
  
  if (totalRequests % 100 === 0) {
    console.log(`Token savings: ${totalSaved} bytes over ${totalRequests} requests`);
  }
  
  return result;
}
```

### 2. Progressive Optimization
```javascript
// Start conservative, increase optimization gradually
const OPTIMIZATION_SCHEDULE = {
  week1: "detailed",
  week2: "standard",
  week3: "minimal"
};

function getCurrentOptimizationLevel() {
  const weeksSinceMigration = getWeeksSinceMigration();
  return OPTIMIZATION_SCHEDULE[`week${Math.min(weeksSinceMigration, 3)}`];
}
```

### 3. Field Caching
```javascript
// Cache field requirements
const FIELD_REQUIREMENTS = {
  boardList: ["id", "name", "closed"],
  boardDetail: ["id", "name", "desc", "prefs", "url"],
  cardEdit: ["id", "name", "desc", "due", "idList", "idMembers", "idLabels"]
};

function getFieldsForOperation(operation) {
  return FIELD_REQUIREMENTS[operation] || [];
}
```

### 4. Error Handling
```javascript
// Handle missing fields gracefully
function safeAccess(obj, path, defaultValue = null) {
  try {
    return path.split('.').reduce((acc, part) => acc[part], obj) || defaultValue;
  } catch {
    return defaultValue;
  }
}

// Usage
const permissionLevel = safeAccess(board, 'prefs.permissionLevel', 'unknown');
```

### 5. Documentation
Document your optimization choices:

```javascript
// optimization-decisions.md
## Optimization Decisions

### Board Operations
- get_boards: minimal (only need ID and name for lists)
- get_board: standard (need prefs for display)

### Card Operations  
- get_cards_in_list: minimal (bulk operation)
- get_card: detailed (editing requires full context)

### Rationale
These levels chosen based on:
1. Token usage analysis showing 80% reduction
2. No functional impact on workflows
3. Performance improvement of 2x
```

## Summary

### Migration Checklist
- [ ] Update to v1.0
- [ ] Add optimization environment variables
- [ ] Test with `optimizationLevel: "full"`
- [ ] Identify required fields for each operation
- [ ] Gradually increase optimization level
- [ ] Monitor token usage reduction
- [ ] Document field requirements
- [ ] Update error handling for missing fields
- [ ] Performance test critical workflows
- [ ] Plan rollback strategy

### Timeline Recommendation
- **Week 1**: Update and test with full responses
- **Week 2**: Enable detailed optimization
- **Week 3**: Move to standard optimization  
- **Week 4**: Implement minimal where appropriate
- **Ongoing**: Monitor and adjust based on usage

### Support
- Migration issues: GitHub Issues
- Performance questions: Discussions
- Real-time help: Discord/Slack community