# Troubleshooting Trello MCP Server in Claude Code

## Known Issues

### Claude Code MCP Server Connection Failures

**Issue**: After configuring the MCP server, Claude Code shows "Status: ✘ failed" with a wrapper script command.

**Cause**: Claude Code sometimes has issues with environment variable handling or MCP server initialization, especially when using wrapper scripts.

**Solutions**:

1. **Direct Configuration (Recommended)**
   Ensure your `~/.claude.json` uses direct npx execution:
   ```json
   {
     "mcpServers": {
       "trello-mcp-server": {
         "command": "npx",
         "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
         "env": {
           "TRELLO_API_KEY": "your_api_key",
           "TRELLO_TOKEN": "your_token"
         }
       }
     }
   }
   ```

2. **Restart Sequence**
   If the server still shows as failed:
   - Close Claude Code completely (not just the window)
   - Wait a few seconds
   - Reopen Claude Code
   
3. **System Restart**
   If issues persist after application restart:
   ```bash
   sudo reboot
   ```
   This often resolves persistent connection issues with MCP servers.

4. **Check MCP Logs**
   - Open Claude Code
   - Check the MCP server logs for specific error messages
   - Look for authentication or connection errors

## Common Issues and Solutions

### 1. Server Not Appearing in Claude Code

**Issue**: After installation, the Trello MCP server doesn't show up in Claude Code.

**Solutions**:

1. **Use the Setup Script (Recommended)**
   The provided setup script now directly modifies the Claude configuration file:
   ```bash
   ./setup-claude-mcp.sh
   ```
   
   Or with credentials as arguments:
   ```bash
   ./setup-claude-mcp.sh YOUR_API_KEY YOUR_TOKEN
   ```

2. **Check Claude Code Configuration**
   - The configuration file is located at `~/.claude.json` on Linux/macOS
   - On Windows, check `%USERPROFILE%\.claude.json`
   - Add the Trello MCP server configuration:

   ```json
   {
     "mcpServers": {
       "trello-mcp-server": {
         "command": "npx",
         "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
         "env": {
           "TRELLO_API_KEY": "your_trello_api_key_here",
           "TRELLO_TOKEN": "your_trello_token_here"
         }
       }
     }
   }
   ```

2. **Alternative: Local Installation**
   If you prefer running from a local installation:
   
   ```json
   {
     "mcpServers": {
       "trello-mcp-server": {
         "command": "node",
         "args": ["/absolute/path/to/trello-mcp-server-optimize/build/index.js"],
         "env": {
           "TRELLO_API_KEY": "your_trello_api_key_here",
           "TRELLO_TOKEN": "your_trello_token_here"
         }
       }
     }
   }
   ```

### 2. Authentication Errors

**Issue**: "Invalid API key" or "Unauthorized" errors.

**Solution**:
1. Get your Trello API credentials from: https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/
2. Ensure both `TRELLO_API_KEY` and `TRELLO_TOKEN` are correctly set in the configuration

### 3. Server Crashes on Startup

**Issue**: The server starts but immediately crashes.

**Debugging Steps**:
1. Test the server manually:
   ```bash
   cd /path/to/trello-mcp-server-optimize
   TRELLO_API_KEY=your_key TRELLO_TOKEN=your_token node build/index.js
   ```

2. Check for missing dependencies:
   ```bash
   npm install
   npm run build
   ```

3. Verify Node.js version (requires Node 18+):
   ```bash
   node --version
   ```

### 4. Tools Not Working in Claude Code

**Issue**: The server appears connected but tools don't work.

**Solutions**:
1. Restart Claude Code after configuration changes
2. Check the Claude Code logs for errors
3. Verify the server is properly built:
   ```bash
   npm run build
   ```

### 5. Permission Errors

**Issue**: "EACCES" or permission denied errors.

**Solution**:
```bash
chmod +x build/index.js
```

## Testing the Server

To verify the server works before using in Claude Code:

```bash
# Set environment variables
export TRELLO_API_KEY="your_key_here"
export TRELLO_TOKEN="your_token_here"

# Run the server
node build/index.js

# The server should start and wait for MCP protocol input
# Press Ctrl+C to exit
```

## Getting Help

1. Check the server logs in Claude Code
2. Run the server manually to see detailed error messages
3. Ensure all environment variables are correctly set
4. Verify your Trello API credentials are valid
5. Check that you're using Node.js version 18 or higher

If issues persist, please open an issue at: https://github.com/Deepankar1993/trello-mcp-server-optimize/issues