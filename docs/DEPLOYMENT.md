# Trello MCP Server Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Integration with AI Assistants](#integration-with-ai-assistants)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **Operating System**: Windows, macOS, or Linux
- **Memory**: Minimum 256MB RAM
- **Network**: Internet connection for Trello API access

### Trello API Credentials
1. Visit [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
2. Create a new Power-Up or use existing
3. Generate API Key
4. Generate Token with appropriate permissions

## Installation

### Method 1: From NPM (Recommended)
```bash
# For Claude Desktop - Add to configuration (see Integration section below)
# No global installation needed - uses npx

# For development or local use
npm install @cyberdeep/trello-mcp-server-optimize
```

### Method 2: From Source
```bash
# Clone repository
git clone https://github.com/Deepankar1993/trello-mcp-server-optimize.git
cd trello-mcp-server-optimize

# Install dependencies
npm install

# Build the project
npm run build
```

### Method 3: Using npx (Recommended for Claude Desktop)
```bash
# Run without installation
npx @cyberdeep/trello-mcp-server-optimize
```

## Configuration

### Environment Variables
Create a `.env` file in your project root:

```bash
# Required
TRELLO_API_KEY=your_trello_api_key_here
TRELLO_TOKEN=your_trello_token_here

# Optional - Optimization
OPTIMIZATION_LEVEL=standard  # minimal, standard, detailed, full
CACHE_ENABLED=false
PERFORMANCE_MONITORING=true

# Optional - Logging
LOG_LEVEL=info  # debug, info, warn, error
LOG_FILE=./logs/trello-mcp.log
```

### Configuration File
Create `trello-mcp.config.json`:

```json
{
  "server": {
    "name": "trello-mcp-server",
    "version": "1.0.0",
    "transport": "stdio"
  },
  "trello": {
    "apiUrl": "https://api.trello.com/1",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "optimization": {
    "defaultLevel": "standard",
    "enforceOptimization": true
  }
}
```

### MCP Configuration
Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["/path/to/trello-mcp-server/build/index.js"],
      "env": {
        "TRELLO_API_KEY": "your_api_key",
        "TRELLO_TOKEN": "your_token"
      }
    }
  }
}
```

## Running the Server

### Development Mode
```bash
# With hot reload
npm run dev

# With debug logging
DEBUG=* npm run dev
```

### Production Mode
```bash
# Build and start
npm run build
npm start

# Or direct execution
node build/index.js
```

### As a Service

#### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start build/index.js --name trello-mcp

# Save configuration
pm2 save
pm2 startup
```

#### Using systemd (Linux)
Create `/etc/systemd/system/trello-mcp.service`:

```ini
[Unit]
Description=Trello MCP Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/trello-mcp-server
ExecStart=/usr/bin/node /path/to/trello-mcp-server/build/index.js
Restart=on-failure
Environment="NODE_ENV=production"
Environment="TRELLO_API_KEY=your_key"
Environment="TRELLO_TOKEN=your_token"

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable trello-mcp
sudo systemctl start trello-mcp
```

## Integration with AI Assistants

### Claude Desktop

#### Option 1: Using Claude MCP CLI (Easiest)
```bash
# One command installation
claude mcp add-json trello-optimized --scope user '{
  "command": "npx",
  "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
  "env": {
    "TRELLO_API_KEY": "your_actual_api_key",
    "TRELLO_TOKEN": "your_actual_token"
  }
}'
```

#### Option 2: Manual Configuration
1. Open Claude Desktop configuration file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/claude/claude_desktop_config.json`

2. Add configuration:

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

### VS Code with Continue
Add to `.continue/config.json`:

```json
{
  "models": [{
    "model": "claude-3",
    "mcpServers": {
      "trello": {
        "command": "npx",
        "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"]
      }
    }
  }]
}
```

### Custom Integration
```javascript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  servers: {
    trello: {
      command: 'npx',
      args: ['-y', '@cyberdeep/trello-mcp-server-optimize'],
      env: {
        TRELLO_API_KEY: process.env.TRELLO_API_KEY,
        TRELLO_TOKEN: process.env.TRELLO_TOKEN
      }
    }
  }
});

await client.connect();
```

## Production Deployment

### Docker Deployment
Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY build ./build

# Set environment
ENV NODE_ENV=production

# Run as non-root user
USER node

# Start server
CMD ["node", "build/index.js"]
```

Build and run:
```bash
docker build -t trello-mcp-server .
docker run -d \
  --name trello-mcp \
  -e TRELLO_API_KEY=your_key \
  -e TRELLO_TOKEN=your_token \
  trello-mcp-server
```

### Cloud Deployment

#### AWS Lambda
```javascript
// handler.js
const { handler } = require('./build/lambda');
exports.handler = handler;
```

#### Google Cloud Functions
```javascript
// index.js
const { handleRequest } = require('./build/gcf');
exports.trelloMcp = handleRequest;
```

### Environment Best Practices

1. **Use Environment Variables**
   - Never hardcode credentials
   - Use secret management services
   - Rotate tokens regularly

2. **Security**
   - Use HTTPS for all communications
   - Implement rate limiting
   - Monitor for unusual activity

3. **Performance**
   - Enable optimization by default
   - Use caching in production
   - Monitor response times

## Monitoring

### Health Check Endpoint
The server provides a health check:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "trello": {
    "connected": true,
    "rateLimit": {
      "remaining": 295,
      "reset": "2023-12-15T12:00:00Z"
    }
  }
}
```

### Logging
Configure logging levels:

```bash
# Development
LOG_LEVEL=debug npm run dev

# Production
LOG_LEVEL=warn npm start
```

Log format:
```
[2023-12-15 10:30:45] [INFO] Server started on stdio
[2023-12-15 10:30:46] [INFO] Connected to Trello API
[2023-12-15 10:30:47] [DEBUG] Tool call: get_boards
```

### Metrics
Enable metrics collection:

```json
{
  "metrics": {
    "enabled": true,
    "interval": 60000,
    "output": "./metrics/performance.json"
  }
}
```

## Troubleshooting

### Common Issues

#### Connection Refused
```
Error: Connection refused
```
**Solution**: Ensure server is running and accessible

#### Authentication Failed
```
Error: Invalid API key or token
```
**Solution**: Verify credentials in environment variables

#### Rate Limit Exceeded
```
Error: Rate limit exceeded
```
**Solution**: Server automatically retries with backoff

#### Module Not Found
```
Error: Cannot find module
```
**Solution**: Run `npm install` and `npm run build`

### Debug Mode
Enable detailed logging:

```bash
# Unix/Linux/macOS
DEBUG=* npm start

# Windows
set DEBUG=* && npm start
```

### Performance Issues

1. **Slow Responses**
   - Enable optimization
   - Check network latency
   - Monitor Trello API status

2. **High Memory Usage**
   - Implement response streaming
   - Enable garbage collection logs
   - Monitor for memory leaks

3. **Timeout Errors**
   - Increase timeout values
   - Check network connectivity
   - Verify Trello API availability

## Maintenance

### Updates
```bash
# Check for updates
npm outdated

# Update to latest
npm update @cyberdeep/trello-mcp-server-optimize

# Update dependencies
npm update
```

### Backup
Regular backups recommended for:
- Configuration files
- Log files
- Performance metrics

### Monitoring Checklist
- [ ] API key validity
- [ ] Token permissions
- [ ] Rate limit usage
- [ ] Error rates
- [ ] Response times
- [ ] Memory usage

## Support

### Getting Help
- GitHub Issues: [github.com/Deepankar1993/trello-mcp-server/issues](https://github.com)
- Documentation: [docs.trello-mcp-server.dev](https://docs.example.com)
- Community: Discord/Slack channel

### Reporting Issues
Include:
1. Server version
2. Error messages
3. Configuration (sanitized)
4. Steps to reproduce
5. Expected vs actual behavior