# Trello MCP Server

[![npm version](https://badge.fury.io/js/%40cyberdeep%2Ftrello-mcp-server-optimize.svg)](https://www.npmjs.com/package/@cyberdeep/trello-mcp-server-optimize)
[![Downloads](https://img.shields.io/npm/dm/@cyberdeep/trello-mcp-server-optimize.svg)](https://www.npmjs.com/package/@cyberdeep/trello-mcp-server-optimize)

**🚀 Token-optimized Trello MCP Server with 97% response reduction**

A Model Context Protocol (MCP) server that provides tools for interacting with the Trello API. Built on the Generic MCP Server Template.

**Repository**: [https://github.com/Deepankar1993/trello-mcp-server-optimize](https://github.com/Deepankar1993/trello-mcp-server-optimize)

## Features

- **Trello Integration**: Complete access to Trello boards, lists, cards, and more
- **Comprehensive API Coverage**: Support for all major Trello operations
- **Modular Architecture**: Clear separation of concerns with a well-defined structure
- **Type Safety**: Full TypeScript support with proper typing for Trello objects
- **Error Handling**: Robust error management throughout the codebase
- **Token Optimization**: Advanced response filtering reduces token usage by up to 97%
- **Smart Defaults**: Intelligent optimization levels based on operation type
- **Array Optimization**: Pagination and summarization for large datasets (97%+ reduction)
- **Response Caching**: In-memory cache with smart TTLs for improved performance
- **Response Summarization**: Human-readable summaries with statistics
- **Content Truncation**: Intelligent text truncation for long descriptions
- **Performance Monitoring**: Real-time metrics and reporting

## 📊 Performance Comparison

| Feature | Standard Trello API | This Optimized Server |
|---------|-------------------|----------------------|
| **Board List Response** | ~800 tokens | ~80 tokens (90% reduction) |
| **Card Details** | ~1200 tokens | ~120 tokens (90% reduction) |
| **Large Card Lists** | ~5000+ tokens | ~150 tokens (97% reduction) |
| **Installation Time** | 10+ minutes | 30 seconds |
| **Cross-Platform Setup** | Complex | Identical everywhere |

**Real Example:**
```json
// Before: 847 tokens
{
  "id": "board123",
  "name": "My Board",
  "desc": "Long description...",
  "descData": { /* huge object */ },
  "prefs": { /* 200+ lines */ },
  "powerUps": [ /* arrays */ ],
  // ... 800+ more tokens
}

// After: 87 tokens  
{
  "id": "board123",
  "name": "My Board", 
  "listsCount": 4,
  "cardsCount": 23,
  "isArchived": false,
  "insights": {
    "hasActivity": true,
    "complexity": "simple"
  }
}
```

## 🎯 Quick Examples

**Get optimized board overview:**
```
"Show me my Trello boards"
```

**Smart card filtering:**
```  
"Get the first 10 urgent cards from my project board"
```

**Efficient summaries:**
```
"Give me a summary of all cards in my To Do list"
```

**Create cards:**
```
"Create a card called 'Review optimization docs' in my In Progress list"
```

## Documentation

- [Architecture Guide](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/ARCHITECTURE.md) - System design and components
- [API Reference](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/API_REFERENCE.md) - Complete tool documentation
- [Deployment Guide](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/DEPLOYMENT.md) - Installation and setup instructions
- [Optimization Guide](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/OPTIMIZATION_GUIDE.md) - Token reduction strategies
- [Troubleshooting](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Migration Guide](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/docs/MIGRATION_GUIDE.md) - Upgrading from v1.0

## Project Structure

```
trello-mcp-server/
├── src/
│   ├── services/       # Service classes for Trello API interactions
│   │   ├── base-service.ts        # Abstract base service with common functionality
│   │   ├── trello-service.ts      # Core Trello API service
│   │   ├── board-service.ts       # Service for Trello boards
│   │   ├── list-service.ts        # Service for Trello lists
│   │   ├── card-service.ts        # Service for Trello cards
│   │   ├── member-service.ts      # Service for Trello members
│   │   ├── label-service.ts       # Service for Trello labels
│   │   ├── checklist-service.ts   # Service for Trello checklists
│   │   └── service-factory.ts     # Factory for creating service instances
│   ├── tools/          # MCP tool definitions and handlers
│   │   ├── board-tools.ts         # Board tool definitions
│   │   ├── board-tool-handlers.ts # Board tool handlers
│   │   ├── list-tools.ts          # List tool definitions
│   │   ├── list-tool-handlers.ts  # List tool handlers
│   │   ├── card-tools.ts          # Card tool definitions
│   │   ├── card-tool-handlers.ts  # Card tool handlers
│   │   ├── member-tools.ts        # Member tool definitions
│   │   ├── member-tool-handlers.ts # Member tool handlers
│   │   ├── label-tools.ts         # Label tool definitions
│   │   ├── label-tool-handlers.ts # Label tool handlers
│   │   ├── checklist-tools.ts     # Checklist tool definitions
│   │   ├── checklist-tool-handlers.ts # Checklist tool handlers
│   │   ├── trello-tools.ts        # Combined tool definitions
│   │   └── trello-tool-handlers.ts # Combined tool handlers
│   ├── types/          # TypeScript type definitions
│   │   ├── trello-types.ts        # Trello type definitions
│   │   └── optimization-types.ts  # Optimization type definitions
│   ├── utils/          # Utility functions
│   │   ├── response-optimizer.ts  # Response optimization engine
│   │   ├── optimization-utils.ts  # Optimization helper functions
│   │   ├── cache-manager.ts       # In-memory cache management
│   │   └── performance-monitor.ts # Performance metrics tracking
│   ├── services/       # Service classes (continued)
│   │   └── response-summarizer.ts # Intelligent response summarization
│   ├── config.ts       # Configuration management
│   └── index.ts        # Main entry point
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## 🚀 Installation

### ⚡ Quick Start (30 seconds)

#### Get Trello API Credentials
1. Visit [Trello Developer Portal](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/)
2. Get your **API Key** and **Token**

#### Option 1: Claude MCP CLI (Easiest - One Command)

**⚠️ Known Issue**: The Claude MCP CLI may not properly save environment variables. If you encounter authentication errors, use the setup script or manual configuration below.

```bash
# Use our setup script (recommended)
curl -sSL https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/setup-claude-mcp.sh | bash

# Or manually with claude mcp (may not save env vars)
claude mcp add-json trello-optimized --scope user '{
  "command": "npx",
  "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
  "env": {
    "TRELLO_API_KEY": "your_actual_api_key",
    "TRELLO_TOKEN": "your_actual_token"
  }
}'
```

#### Option 2: Claude Desktop (Manual Configuration)

Edit your Claude Desktop configuration file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/claude/claude_desktop_config.json`

Add the following configuration:
```json
{
  "mcpServers": {
    "trello-optimized": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
      "env": {
        "TRELLO_API_KEY": "your_actual_api_key",
        "TRELLO_TOKEN": "your_actual_token"
      }
    }
  }
}
```

#### Option 3: Other MCP Clients (Cursor, etc.)
```json
{
  "mcpServers": {
    "trello-optimized": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"]
    }
  }
}
```

#### Test Installation
Restart Claude Desktop and try:
```
"Show me my Trello boards with optimization"
```

### 🔧 Development Installation
*For contributors and advanced users only*

1. Clone this repository:
   ```bash
   git clone https://github.com/Deepankar1993/trello-mcp-server-optimize.git
   cd trello-mcp-server-optimize
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your Trello API key and token:
   ```
   TRELLO_API_KEY=your_trello_api_key
   TRELLO_TOKEN=your_trello_token
   ```

   You can obtain these from the [Trello Developer Portal](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/).

### Building and Running

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the server:
   ```bash
   npm start
   ```

## Available Tools

The server provides tools for interacting with all major Trello resources:

### Board Tools
- `get_boards` - Get all boards for the authenticated user
- `get_board` - Get a specific board by ID
- `create_board` - Create a new board
- `update_board` - Update an existing board
- `delete_board` - Delete a board
- `get_board_lists` - Get all lists on a board
- `get_board_members` - Get all members of a board
- `get_board_labels` - Get all labels on a board
- `close_board` - Close (archive) a board
- `reopen_board` - Reopen a closed board

### List Tools
- `get_list` - Get a specific list by ID
- `create_list` - Create a new list on a board
- `update_list` - Update an existing list
- `archive_list` - Archive a list
- `unarchive_list` - Unarchive a list
- `move_list_to_board` - Move a list to a different board
- `get_cards_in_list` - Get all cards in a list
- `archive_all_cards` - Archive all cards in a list
- `move_all_cards` - Move all cards in a list to another list
- `update_list_position` - Update the position of a list on a board
- `update_list_name` - Update the name of a list
- `subscribe_to_list` - Subscribe to a list

### Card Tools
- `get_card` - Get a specific card by ID
- `create_card` - Create a new card
- `update_card` - Update an existing card
- `delete_card` - Delete a card
- `archive_card` - Archive a card
- `unarchive_card` - Unarchive a card
- `move_card_to_list` - Move a card to a different list
- `add_comment` - Add a comment to a card
- `get_comments` - Get comments on a card
- `add_attachment` - Add an attachment to a card
- `get_attachments` - Get attachments on a card
- `delete_attachment` - Delete an attachment from a card
- `add_member` - Add a member to a card
- `remove_member` - Remove a member from a card
- `add_label` - Add a label to a card
- `remove_label` - Remove a label from a card
- `set_due_date` - Set the due date for a card
- `set_due_complete` - Mark a card's due date as complete or incomplete

### Member Tools
- `get_me` - Get the authenticated member (current user)
- `get_member` - Get a specific member by ID or username
- `get_member_boards` - Get boards that a member belongs to
- `get_member_cards` - Get cards assigned to a member
- `get_boards_invited` - Get boards that a member has been invited to
- `get_member_organizations` - Get organizations that a member belongs to
- `get_notifications` - Get notifications for the authenticated member
- `update_me` - Update the authenticated member's information
- `get_avatar` - Get the authenticated member's avatar
- `search_members` - Search for members by name
- `get_board_members` - Get members of a board
- `get_organization_members` - Get members of an organization
- `get_card_members` - Get members assigned to a card

### Label Tools
- `get_label` - Get a specific label by ID
- `create_label` - Create a new label on a board
- `update_label` - Update an existing label
- `delete_label` - Delete a label
- `get_board_labels` - Get all labels on a board
- `update_label_name` - Update the name of a label
- `update_label_color` - Update the color of a label
- `create_label_on_card` - Create a new label directly on a card
- `get_card_labels` - Get all labels on a card
- `add_label_to_card` - Add a label to a card
- `remove_label_from_card` - Remove a label from a card

### Checklist Tools
- `get_checklist` - Get a specific checklist by ID
- `create_checklist` - Create a new checklist on a card
- `update_checklist` - Update an existing checklist
- `delete_checklist` - Delete a checklist
- `get_checkitems` - Get all checkitems on a checklist
- `create_checkitem` - Create a new checkitem on a checklist
- `get_checkitem` - Get a specific checkitem on a checklist
- `update_checkitem` - Update a checkitem on a checklist
- `delete_checkitem` - Delete a checkitem from a checklist
- `update_checklist_name` - Update the name of a checklist
- `update_checklist_position` - Update the position of a checklist on a card
- `get_checklist_board` - Get the board a checklist is on
- `get_checklist_card` - Get the card a checklist is on
- `update_checkitem_state_on_card` - Update a checkitem's state on a card

## Token Optimization Features

This server includes advanced optimization features that significantly reduce token usage while maintaining full functionality. These features are designed to be 100% backward compatible - existing integrations will continue to work without any changes.

### Smart Defaults System

The server automatically applies optimal response filtering based on the operation type:

- **LIST operations** (e.g., `get_boards`, `get_cards_in_list`): Use `minimal` optimization
- **DETAIL operations** (e.g., `get_board`, `get_card`): Use `standard` optimization
- **ADMIN operations** (e.g., `update_board`, `delete_card`): Use `detailed` optimization
- **ACTION operations** (e.g., `add_comment`, `move_card`): Use `minimal` optimization

This means you get optimized responses automatically without any configuration!

### Optimization Levels

You can override the smart defaults by specifying a `detailLevel` parameter:

```javascript
// Minimal - Essential fields only (fastest, 74-86% token reduction)
{
  tool: "get_boards",
  arguments: {
    detailLevel: "minimal"
  }
}

// Standard - Common fields for typical use cases (default for detail operations)
{
  tool: "get_card",
  arguments: {
    cardId: "123",
    detailLevel: "standard"
  }
}

// Detailed - Most fields, excluding only rarely-used data
{
  tool: "get_board",
  arguments: {
    boardId: "456",
    detailLevel: "detailed"
  }
}

// Full - Complete API response (no filtering)
{
  tool: "get_card",
  arguments: {
    cardId: "789",
    detailLevel: "full"
  }
}
```

### Array Optimization

For operations that return arrays, you can use pagination and summarization:

#### Pagination with `maxItems`
```javascript
// Get only the first 5 boards
{
  tool: "get_boards",
  arguments: {
    maxItems: 5
  }
}

// Get only the first 10 cards in a list
{
  tool: "get_cards_in_list",
  arguments: {
    listId: "abc123",
    maxItems: 10
  }
}
```

#### Summarization
```javascript
// Get a summary of all boards (95% token reduction!)
{
  tool: "get_boards",
  arguments: {
    summarize: true
  }
}

// Returns:
{
  summary: {
    totalCount: 25,
    items: [
      { id: "123", name: "Project Board" },
      { id: "456", name: "Personal Tasks" },
      // ... first 5 items
    ],
    hasMore: true,
    remainingCount: 20
  }
}
```

### Response Caching

The server includes an intelligent caching layer that:

- Caches optimized responses for read operations
- Uses smart TTLs based on data volatility:
  - User/member data: 10 minutes
  - Board structure: 5 minutes  
  - Cards and dynamic content: 1-2 minutes
- Automatically invalidates cache on write operations
- Improves performance for repeated queries

Caching is enabled by default and requires no configuration.

### Usage Examples

#### Example 1: Get boards with minimal data
```javascript
// Automatic optimization (recommended)
{
  tool: "get_boards",
  arguments: {
    filter: "open"
  }
}
// Returns only essential fields: id, name, url, closed, starred
```

#### Example 2: Get detailed card information
```javascript
// Get standard details for a card
{
  tool: "get_card",
  arguments: {
    cardId: "xyz789"
    // detailLevel: "standard" is applied automatically
  }
}
// Returns common fields needed for card display
```

#### Example 3: List many cards efficiently
```javascript
// Get first 20 cards with minimal data
{
  tool: "get_cards_in_list",
  arguments: {
    listId: "list123",
    maxItems: 20,
    detailLevel: "minimal"
  }
}
```

#### Example 4: Get a quick overview of large datasets
```javascript
// Summarize all cards in a list
{
  tool: "get_cards_in_list",
  arguments: {
    listId: "list456",
    summarize: true
  }
}
// Returns count and sample of cards, using ~95% fewer tokens
```

### Migration Guide

**For existing users**: No changes required! The optimization features are fully backward compatible:

1. All existing tool calls will continue to work exactly as before
2. Smart defaults are applied automatically for better performance
3. You can opt into additional optimizations when ready

To start using optimization features:

1. **Let smart defaults work for you** - No code changes needed
2. **Add `maxItems` for large lists** - Limit response sizes
3. **Use `summarize` for overviews** - Get counts and samples
4. **Specify `detailLevel` for control** - Override defaults when needed

### Performance Metrics

- **Token Reduction**: 62.3% average, up to 97.6% for arrays
- **Array Summarization**: 97.4-97.6% reduction for large datasets
- **Single Entity Operations**: 36-89% reduction depending on level
- **Execution Overhead**: < 1ms average processing time
- **Cache Hit Rate**: Improves with usage
- **Compatibility**: 100% backward compatible

See the performance metrics in our [documentation](docs/OPTIMIZATION_GUIDE.md#performance-metrics) for detailed benchmarks.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test src/__tests__/utils/response-optimizer.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The project includes comprehensive test coverage for optimization features:

- **Response Optimizer**: 75.67% coverage
- **Response Summarizer**: 72.14% coverage
- **Cache Manager**: 55.07% coverage
- **Performance Monitor**: 61.53% coverage

### Performance Validation

To validate performance improvements:

1. **With Real API** (requires valid Trello credentials):
   ```bash
   node scripts/tests/test-performance-validation.js
   ```

2. **Simulation Mode** (no API access required):
   ```bash
   node scripts/tests/test-performance-simulation.js
   ```

Both scripts will generate detailed performance reports showing token reduction metrics.

## Configuration

The server uses a centralized configuration system in `src/config.ts`. Configuration can be provided through:

- Environment variables
- Command line arguments (with `--env KEY=VALUE`)
- Default values in the code

Required environment variables:
- `TRELLO_API_KEY` - Your Trello API key
- `TRELLO_TOKEN` - Your Trello API token

Optional optimization settings (via environment variables):
- `ENABLE_RESPONSE_OPTIMIZATION` - Enable/disable response optimization (default: `true`)
- `DEFAULT_OPTIMIZATION_LEVEL` - Default level when not specified (default: `smart`)
- `MAX_RESPONSE_SIZE` - Maximum response size before auto-summarization (default: `10000`)
- `ENABLE_SUMMARIZATION` - Enable automatic summarization for large responses (default: `true`)
- `ENABLE_CACHING` - Enable/disable response caching (default: `true`)
- `CACHE_MAX_SIZE` - Maximum number of cached responses (default: `1000`)
- `CACHE_CLEANUP_INTERVAL` - Cache cleanup interval in ms (default: `300000` - 5 minutes)
- `TRUNCATE_DESCRIPTIONS` - Maximum length for description fields (default: `200`)
- `ENABLE_METRICS` - Enable performance metrics collection (default: `false`)

## Error Handling

The server includes comprehensive error handling:

- Service-level error handling with rate limiting support
- Tool-level error handling with proper error messages
- MCP protocol error handling
- Trello API error handling

## Changelog

### v2.0.0 - Advanced Optimization Release
- Added smart defaults system with automatic optimization based on operation type
- Implemented response filtering with up to 97.6% token reduction
- Added array optimization features (pagination with `maxItems` and `summarize`)
- Built enterprise-grade caching layer with smart TTLs
- Added intelligent response summarization with statistics
- Implemented content truncation for long text fields
- Added performance monitoring and metrics reporting
- Added support for `detailLevel` parameter (minimal, standard, detailed, full)
- Maintained 100% backward compatibility
- Updated all 75 tool operations with optimization support
- Added comprehensive documentation and migration guide

### v1.0.0 - Initial Release
- Complete Trello API integration
- Support for boards, lists, cards, members, labels, and checklists
- MCP protocol implementation
- Basic error handling and configuration

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Deepankar1993/trello-mcp-server-optimize/blob/master/LICENSE) file for details.
