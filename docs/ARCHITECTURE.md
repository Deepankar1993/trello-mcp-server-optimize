# Trello MCP Server Architecture

## Table of Contents
- [System Overview](#system-overview)
- [Core Architecture](#core-architecture)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [Optimization Architecture](#optimization-architecture)
- [Configuration System](#configuration-system)
- [Error Handling](#error-handling)
- [Design Patterns](#design-patterns)

## System Overview

The Trello MCP Server is a Model Context Protocol (MCP) implementation that provides AI assistants with structured access to the Trello API. Built with TypeScript and designed for optimal token efficiency, it serves as a bridge between AI models and Trello's project management capabilities.

### Key Features
- Complete Trello API coverage through 80+ MCP tools
- Advanced token optimization with 70-80% reduction
- Operation-specific response filtering
- Modular, maintainable architecture
- Comprehensive error handling
- Performance monitoring capabilities

## Core Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   AI Assistant  │────▶│   MCP Protocol   │────▶│  Trello MCP      │
│  (Claude, etc)  │◀────│    Interface     │◀────│    Server        │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Tool Layer                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │   Board   │  │   Card    │  │   List    │  │   Member    │ │
│  │   Tools   │  │   Tools   │  │   Tools   │  │    Tools    │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Handler Layer                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │   Board   │  │   Card    │  │   List    │  │   Member    │ │
│  │ Handlers  │  │ Handlers  │  │ Handlers  │  │  Handlers   │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                               │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ BaseService  │◀─│ Entity Services│  │Response Summarizer│  │
│  │  (Abstract)  │  │  (Board, Card) │  │  (Optimization)  │  │
│  └──────────────┘  └────────────────┘  └────────────────────┘  │
│           ▲                                                     │
│           │                                                     │
│  ┌────────────────┐  ┌─────────────────┐                      │
│  │ TrelloService  │  │ ServiceFactory  │                      │
│  │  (Singleton)   │  │  (Singleton)    │                      │
│  └────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │  Trello API  │
                           └──────────────┘
```

## Component Details

### 1. MCP Protocol Interface (`src/index.ts`)
- Initializes MCP server with stdio transport
- Registers all available tools dynamically
- Routes tool calls to appropriate handlers
- Manages server lifecycle and error boundaries

### 2. Tool Layer (`src/tools/*-tools.ts`)
- Defines MCP tool schemas with TypeScript/JSON Schema
- Provides tool metadata (name, description, parameters)
- Groups tools by entity type (board, card, list, etc.)
- Validates input parameters automatically

### 3. Handler Layer (`src/tools/*-tool-handlers.ts`)
- Implements business logic for each tool
- Parses and validates tool arguments
- Invokes appropriate service methods
- Applies optimization based on tool parameters
- Formats responses for MCP protocol

### 4. Service Layer (`src/services/`)

#### BaseService (Abstract)
- Common HTTP operations (GET, POST, PUT, DELETE)
- Rate limiting with exponential backoff
- Error handling and retry logic
- Request/response logging

#### TrelloService (Singleton)
- Manages Trello API authentication
- Centralizes API endpoint configuration
- Provides typed request methods
- Handles API-specific error codes

#### Entity Services
- **BoardService**: Board operations (create, update, list, etc.)
- **CardService**: Card management and modifications
- **ListService**: List operations and card movements
- **MemberService**: User and membership management
- **LabelService**: Label creation and assignment
- **ChecklistService**: Checklist and item management

#### ResponseSummarizer
- Filters responses based on optimization level
- Removes redundant data fields
- Preserves essential information
- Reduces token usage by 70-80%

### 5. Utility Layer (`src/utils/`)
- **response-optimizer.ts**: Dynamic field filtering
- **token-measurement.ts**: Token usage tracking
- **performance-monitor.ts**: Operation timing
- **cache-manager.ts**: Response caching (future)
- **tool-optimization-params.ts**: Default optimization configs

### 6. Type Definitions (`src/types/`)
- **trello-types.ts**: Complete Trello API type definitions
- **optimization-types.ts**: Optimization configuration types

## Data Flow

### Standard Request Flow
1. AI Assistant invokes MCP tool with parameters
2. MCP Protocol Interface receives and validates request
3. Tool definition validates parameter schema
4. Handler processes request and determines optimization
5. Service layer executes Trello API call
6. Response flows back through optimization
7. Formatted response returned to AI

### Optimization Flow
```
Raw Response → Response Summarizer → Field Filtering → Token Reduction → Optimized Response
     │                    │                   │                │                    │
     └─────── 2KB ───────┴────── 1.2KB ──────┴──── 0.8KB ─────┴───── 0.4KB ───────┘
```

## Optimization Architecture

### Optimization Levels
1. **minimal**: Essential fields only (ID, name, basic status)
2. **standard**: Common fields for typical operations
3. **detailed**: Extended fields for complex operations
4. **full**: Complete response (no filtering)

### Operation-Specific Optimization
```json
{
  "board": {
    "get_boards": {
      "level": "minimal",
      "fields": ["id", "name", "closed", "url"]
    },
    "get_board": {
      "level": "standard",
      "additionalFields": ["desc", "prefs", "memberships"]
    }
  }
}
```

### Dynamic Field Selection
- Tool handlers can override default optimization
- Users can specify custom field lists
- Nested object filtering preserves structure
- Array handling maintains item consistency

## Configuration System

### Environment Variables
```bash
# Required
TRELLO_API_KEY=your_api_key
TRELLO_TOKEN=your_token

# Optional
OPTIMIZATION_LEVEL=standard
CACHE_ENABLED=false
PERFORMANCE_MONITORING=true
```

### Configuration Loading (`src/config.ts`)
1. Load from environment variables
2. Apply command-line overrides
3. Validate required fields
4. Provide typed configuration object
5. Support for future expansion

### Optimization Configuration
- Global defaults in `optimization.config.json`
- Operation presets in `optimization-presets/`
- Runtime override capabilities
- Extensible for new operations

## Error Handling

### Error Hierarchy
```
McpError
├── ValidationError (400)
├── AuthenticationError (401)
├── NotFoundError (404)
├── RateLimitError (429)
└── ServerError (500+)
```

### Error Recovery Strategies
1. **Validation Errors**: Return clear parameter requirements
2. **Authentication**: Prompt for credential verification
3. **Rate Limits**: Exponential backoff with retry
4. **Not Found**: Suggest alternative resources
5. **Server Errors**: Retry with circuit breaker

### Error Response Format
```typescript
{
  error: {
    code: string,
    message: string,
    details?: any,
    retryable?: boolean
  }
}
```

## Design Patterns

### 1. Singleton Pattern
- **TrelloService**: Single API connection instance
- **ServiceFactory**: Centralized service management
- Ensures consistent state and configuration

### 2. Factory Pattern
- **ServiceFactory**: Creates and manages service instances
- Lazy initialization of services
- Dependency injection for testability

### 3. Abstract Base Class
- **BaseService**: Common functionality inheritance
- Template method for HTTP operations
- Consistent error handling across services

### 4. Strategy Pattern
- **Response optimization**: Interchangeable filtering strategies
- Level-based response transformation
- Extensible for custom strategies

### 5. Modular Architecture
- Entity-based file organization
- Clear separation of concerns
- Independent testing capabilities
- Easy feature addition

## Performance Considerations

### Token Optimization Impact
- 70-80% reduction in response size
- Faster AI processing times
- Lower API costs for users
- Maintained response accuracy

### Caching Strategy (Future)
- Response caching by request hash
- TTL-based invalidation
- Cache warming for common requests
- Memory-efficient storage

### Monitoring Capabilities
- Request/response timing
- Token usage tracking
- Error rate monitoring
- Performance benchmarking

## Security Considerations

### Authentication
- API credentials never logged
- Secure environment variable storage
- No credential persistence
- Token rotation support

### Data Privacy
- No sensitive data caching
- Minimal data retention
- Audit trail capabilities
- GDPR compliance ready

## Extensibility

### Adding New Features
1. Create service methods in appropriate service class
2. Define tool schema in entity tools file
3. Implement handler in entity handlers file
4. Update combined exports
5. Add TypeScript types if needed
6. Update optimization presets

### Integration Points
- Custom optimization strategies
- Additional API providers
- Webhook support (future)
- Plugin architecture (future)