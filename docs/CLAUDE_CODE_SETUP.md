# Claude Code Setup Guide for Trello MCP Server

## Quick Fix

If the server works in Claude Desktop but fails in Claude Code, try these solutions:

### Solution 1: Use npx with full package name

In Claude Code settings, add:

```json
{
  "mcpServers": {
    "trello-optimized": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize@latest"],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Solution 2: Install globally and use direct command

1. Install globally:
```bash
npm install -g @cyberdeep/trello-mcp-server-optimize
```

2. Configure Claude Code:
```json
{
  "mcpServers": {
    "trello-optimized": {
      "command": "trello-mcp-optimize",
      "args": [],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Solution 3: Use absolute path (if other methods fail)

1. Find where npm installed the package:
```bash
npm list -g @cyberdeep/trello-mcp-server-optimize
```

2. Use the full path in configuration:
```json
{
  "mcpServers": {
    "trello-optimized": {
      "command": "node",
      "args": ["/full/path/to/node_modules/@cyberdeep/trello-mcp-server-optimize/build/index.js"],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Troubleshooting Steps

### 1. Check Claude Code Developer Console
- Open Claude Code
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Opt+I` (Mac)
- Look for errors in the Console tab
- Search for "MCP" or "trello" in the logs

### 2. Verify Node.js is in PATH
```bash
which node
which npx
```

### 3. Test the server manually
```bash
# This should timeout (which means it's working)
npx -y @cyberdeep/trello-mcp-server-optimize@latest
```

### 4. Check Claude Code MCP settings location
- Windows: `%APPDATA%\Code\User\globalStorage\anysphere.claude-code\settings\cline_mcp_settings.json`
- macOS: `~/Library/Application Support/Code/User/globalStorage/anysphere.claude-code/settings/cline_mcp_settings.json`
- Linux: `~/.config/Code/User/globalStorage/anysphere.claude-code/settings/cline_mcp_settings.json`

### 5. Common Issues and Solutions

**Issue: "command not found"**
- Solution: Use `npx` instead of direct command
- Alternative: Use full path to node executable

**Issue: Server starts but doesn't connect**
- Solution: Check environment variables are set correctly
- Verify: No console output interfering with MCP protocol

**Issue: Works in terminal but not in Claude Code**
- Solution: Claude Code might have different PATH
- Try: Use absolute paths instead of relative

**Issue: "ENOENT" or "spawn error"**
- Solution: Node.js might not be in Claude Code's PATH
- Fix: Restart Claude Code after installing Node.js

## Testing Your Configuration

Create a test file `test-config.js`:

```javascript
import { spawn } from 'child_process';

// Replace with your actual configuration
const config = {
  command: "npx",
  args: ["-y", "@cyberdeep/trello-mcp-server-optimize@latest"],
  env: {
    ...process.env,
    TRELLO_API_KEY: "test",
    TRELLO_TOKEN: "test"
  }
};

const child = spawn(config.command, config.args, {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: config.env
});

child.on('spawn', () => console.log('✅ Server started'));
child.on('error', (err) => console.error('❌ Error:', err.message));

setTimeout(() => {
  child.kill();
  console.log('Test complete');
}, 2000);
```

Run with: `node test-config.js`

## Still Not Working?

1. **Report the issue**: Include the error from Claude Code developer console
2. **Try older version**: `@cyberdeep/trello-mcp-server-optimize@1.0.6`
3. **Check Claude Code version**: Ensure you have the latest version
4. **Restart everything**: Sometimes a full restart of Claude Code helps

## Working Example

Here's a confirmed working configuration:

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

After adding this configuration:
1. Save the settings
2. Restart Claude Code
3. The server should appear in the MCP servers list
4. Look for "trello-optimized ✓ connected" status