# Trello MCP Server Troubleshooting Guide

## Table of Contents
- [Common Issues](#common-issues)
- [Authentication Problems](#authentication-problems)
- [Connection Issues](#connection-issues)
- [Performance Problems](#performance-problems)
- [Tool-Specific Issues](#tool-specific-issues)
- [Debugging Techniques](#debugging-techniques)
- [Error Reference](#error-reference)
- [FAQ](#faq)

## Common Issues

### Server Won't Start

#### Symptom
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

#### Solution
1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Check Node.js version:
   ```bash
   node --version  # Should be 16.x or higher
   ```

### TypeScript Compilation Errors

#### Symptom
```
error TS2307: Cannot find module './types/trello-types'
```

#### Solution
1. Clean and rebuild:
   ```bash
   rm -rf build/
   npm run build
   ```
2. Check TypeScript version:
   ```bash
   npx tsc --version  # Should match package.json
   ```

### Console Output Interfering with MCP

#### Symptom
- AI assistant shows raw JSON or errors
- Commands appear in chat

#### Solution
The server redirects console to stderr. Ensure no custom logging to stdout:
```javascript
// Wrong
console.log("Debug info");

// Correct
console.error("Debug info");
```

## Authentication Problems

### Invalid API Key

#### Symptom
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid API key"
  }
}
```

#### Solution
1. Verify API key format:
   - Should be 32 characters
   - Only alphanumeric characters
   
2. Check environment variable:
   ```bash
   echo $TRELLO_API_KEY
   ```

3. Regenerate if needed:
   - Visit [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
   - Create new or view existing Power-Up

### Invalid Token

#### Symptom
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid token"
  }
}
```

#### Solution
1. Generate new token:
   ```
   https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY
   ```

2. Verify token permissions:
   - Read access minimum
   - Write access for modifications
   - Account access for member operations

3. Check token expiration:
   - Use "never" for development
   - Set appropriate expiration for production

### Permission Denied

#### Symptom
```json
{
  "error": {
    "message": "Insufficient permissions"
  }
}
```

#### Solution
1. Verify board membership
2. Check organization permissions
3. Regenerate token with proper scope:
   ```
   scope=read,write,account
   ```

## Connection Issues

### Timeout Errors

#### Symptom
```
Error: Request timeout after 30000ms
```

#### Solution
1. Increase timeout in config:
   ```json
   {
     "trello": {
       "timeout": 60000
     }
   }
   ```

2. Check network connectivity:
   ```bash
   ping api.trello.com
   ```

3. Verify Trello API status:
   - Check [Trello Status](https://trello.status.atlassian.com/)

### Rate Limiting

#### Symptom
```json
{
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Rate limit exceeded"
  }
}
```

#### Solution
1. Server automatically retries with backoff
2. Monitor rate limit headers:
   ```javascript
   X-RateLimit-Remaining: 295
   X-RateLimit-Reset: 1639756800
   ```

3. Implement caching for repeated requests
4. Reduce request frequency

### SSL/TLS Errors

#### Symptom
```
Error: unable to verify the first certificate
```

#### Solution
1. Update Node.js to latest version
2. For corporate proxies:
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED=0  # Development only!
   ```
3. Configure proper certificates for production

## Performance Problems

### Slow Response Times

#### Symptom
- Tools taking >5 seconds to respond
- Timeouts on large boards

#### Solution
1. Enable optimization:
   ```json
   {
     "optimizationLevel": "minimal"
   }
   ```

2. Use field filtering:
   ```json
   {
     "fields": ["id", "name", "closed"]
   }
   ```

3. Monitor performance:
   ```bash
   PERFORMANCE_MONITORING=true npm start
   ```

### High Memory Usage

#### Symptom
- Server consuming >500MB RAM
- Memory steadily increasing

#### Solution
1. Enable garbage collection logs:
   ```bash
   node --expose-gc build/index.js
   ```

2. Implement response streaming for large data
3. Clear caches periodically
4. Monitor for memory leaks:
   ```bash
   node --inspect build/index.js
   ```

### Token Limit Exceeded

#### Symptom
- AI assistant truncating responses
- Context window errors

#### Solution
1. Use aggressive optimization:
   ```json
   {
     "optimizationLevel": "minimal"
   }
   ```

2. Paginate large results
3. Use specific field selection
4. Enable response summarization

## Tool-Specific Issues

### Board Tools

#### get_boards Returns Empty
**Cause**: No boards accessible to token
**Solution**: 
- Verify token has board read access
- Check board membership
- Try with different filter

#### create_board Fails
**Cause**: Organization restrictions
**Solution**:
- Check organization permissions
- Verify idOrganization is valid
- Try without organization first

### Card Tools

#### Card Not Found
**Cause**: Card archived or deleted
**Solution**:
```json
{
  "filter": "all"  // Include archived
}
```

#### Can't Move Card
**Cause**: List on different board
**Solution**:
- Verify list belongs to same board
- Check board permissions

### List Tools

#### List Operations Fail
**Cause**: List archived
**Solution**:
1. Unarchive first:
   ```json
   {
     "listId": "...",
     "closed": false
   }
   ```

### Member Tools

#### Member Not Found
**Cause**: Username changed or deleted
**Solution**:
- Use member ID instead of username
- Search by email if available

## Debugging Techniques

### Enable Debug Logging

```bash
# Full debug output
DEBUG=* npm start

# Specific module
DEBUG=trello:* npm start

# Multiple modules
DEBUG=trello:*,mcp:* npm start
```

### Inspect Raw Requests

```javascript
// Add to BaseService
protected async request(options: RequestOptions) {
  console.error('Request:', JSON.stringify(options, null, 2));
  const response = await this.httpRequest(options);
  console.error('Response:', JSON.stringify(response, null, 2));
  return response;
}
```

### Test Individual Tools

```bash
# Create test script
cat > test-tool.js << 'EOF'
const { TrelloService } = require('./build/services/trello-service');
const { BoardService } = require('./build/services/board-service');

async function test() {
  const trello = TrelloService.getInstance();
  const boards = new BoardService(trello);
  
  try {
    const result = await boards.getBoards({ filter: 'open' });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
EOF

node test-tool.js
```

### Trace MCP Communication

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["--inspect", "build/index.js"],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

## Error Reference

### Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `VALIDATION_ERROR` | Invalid parameters | Missing required fields, wrong types |
| `AUTHENTICATION_ERROR` | Auth failed | Invalid credentials, expired token |
| `NOT_FOUND` | Resource missing | Deleted, no access, wrong ID |
| `RATE_LIMIT_ERROR` | Too many requests | Exceeded API limits |
| `SERVER_ERROR` | Trello API error | Service down, internal error |
| `TIMEOUT_ERROR` | Request timeout | Network issues, large response |
| `OPTIMIZATION_ERROR` | Filter failed | Invalid field paths |

### Error Messages

#### "Board not found"
- Board deleted or no access
- Invalid board ID format
- Token lacks board permission

#### "Invalid request"
- Malformed JSON
- Missing required parameters
- Invalid parameter types

#### "Conflict"
- Resource already exists
- Concurrent modification
- Unique constraint violation

## FAQ

### Q: Why are responses so large?
**A**: Enable optimization:
```json
{
  "optimizationLevel": "minimal"
}
```

### Q: Can I use multiple Trello accounts?
**A**: Yes, configure multiple server instances:
```json
{
  "mcpServers": {
    "trello-personal": { ... },
    "trello-work": { ... }
  }
}
```

### Q: How do I handle archived items?
**A**: Use appropriate filters:
```json
{
  "filter": "all",  // Includes archived
  "filter": "closed"  // Only archived
}
```

### Q: Why do some fields return null?
**A**: Fields may be:
- Not available at your permission level
- Not applicable to the resource
- Filtered by optimization

### Q: Can I disable optimization?
**A**: Yes, use:
```json
{
  "optimizationLevel": "full"
}
```

### Q: How do I report bugs?
**A**: Include:
1. Tool name and parameters
2. Error message
3. Debug logs
4. Expected behavior
5. Environment details

### Q: Is there a rate limit?
**A**: Trello API limits:
- 300 requests per 10 seconds per token
- 1000 requests per 10 minutes per token
- 100 requests per 10 seconds per API key

### Q: Can I cache responses?
**A**: Caching planned for future release. Currently:
- Implement client-side caching
- Use optimization to reduce requests
- Batch operations when possible

## Getting Help

### Support Channels
1. GitHub Issues - Bug reports
2. Discussions - General questions
3. Discord/Slack - Community help

### Information to Provide
- Server version: `npm list trello-mcp-server`
- Node.js version: `node --version`
- Error messages and stack traces
- Debug logs with sensitive data removed
- Steps to reproduce

### Quick Fixes Checklist
- [ ] Dependencies installed
- [ ] Project built
- [ ] Credentials valid
- [ ] Permissions adequate
- [ ] Network accessible
- [ ] Optimization enabled
- [ ] Latest version