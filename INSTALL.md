# Installation Guide - Trello MCP Server

This guide covers installation on WSL, Linux, and macOS for both Claude Desktop and Claude CLI.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Trello API Credentials**
   - Get your API Key: https://trello.com/app-key
   - Generate a Token using the link on the API Key page

## Quick Install (Universal Script)

We provide a universal setup script that works on all platforms:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/cyberdeep/trello-mcp-server-optimize/master/setup-universal.sh
chmod +x setup-universal.sh
./setup-universal.sh
```

Or if you've cloned the repository:

```bash
./setup-universal.sh
```

The script will:
- Detect your operating system (WSL/Linux/macOS)
- Ask for your Trello credentials
- Let you choose between Claude Desktop, Claude CLI, or both
- Configure everything automatically

## Manual Installation

### Option 1: Claude Desktop (Claude Code)

#### Windows/WSL

1. Find your configuration file:
   - WSL: `~/.claude.json` or `~/.config/claude/claude_desktop_config.json`
   - Windows: `%USERPROFILE%\.claude.json` or `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration:

```json
{
  "userMcpServers": {
    "trello-mcp-server": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### macOS

1. Find your configuration file:
   - `~/.claude.json` or
   - `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the same configuration as above

#### Linux

1. Find your configuration file:
   - `~/.claude.json` or
   - `~/.config/claude/claude_desktop_config.json`

2. Add the same configuration as above

### Option 2: Claude CLI

Since the Claude CLI has a bug with environment variables, we use a wrapper script approach:

#### All Platforms (WSL/Linux/macOS)

1. Create a wrapper script:

```bash
mkdir -p ~/.claude-mcp-wrappers
cat > ~/.claude-mcp-wrappers/trello-mcp.sh << 'EOF'
#!/bin/bash
export TRELLO_API_KEY="your_api_key_here"
export TRELLO_TOKEN="your_token_here"
exec npx -y @cyberdeep/trello-mcp-server-optimize
EOF
chmod +x ~/.claude-mcp-wrappers/trello-mcp.sh
```

2. Add to Claude CLI:

```bash
claude mcp add ~/.claude-mcp-wrappers/trello-mcp.sh --name trello-mcp-server
```

3. Verify installation:

```bash
claude mcp list
```

## Platform-Specific Notes

### WSL (Windows Subsystem for Linux)

- Claude Desktop config is usually at `~/.claude.json`
- Make sure to use Unix line endings (LF) for scripts
- Both Claude Desktop and CLI configurations work in WSL

### macOS

- Claude Desktop might use `~/Library/Application Support/Claude/`
- Ensure you have proper permissions for the config directory
- May need to allow terminal access in System Preferences

### Linux

- Config locations are typically in `~/.config/` directories
- Ensure Python 3 is installed for the setup scripts
- May need to install `curl` if using the download method

## Verification

### Claude Desktop
1. Restart Claude Desktop
2. The server should appear in the MCP servers list
3. Test by asking Claude to list your Trello boards

### Claude CLI
1. Run `claude mcp list` to see the server
2. Test with: `claude chat "List my Trello boards using the MCP server"`

## Troubleshooting

### Environment Variables Not Working

This is a known issue with Claude CLI. The wrapper script approach (included in our setup) is the recommended workaround.

### Permission Denied

```bash
chmod +x setup-universal.sh
chmod +x ~/.claude-mcp-wrappers/trello-mcp.sh
```

### Config File Not Found

1. Ensure Claude Desktop/CLI is installed
2. Run Claude at least once to create config files
3. Check all possible locations listed above

### Server Not Appearing

1. Check the configuration was added correctly
2. Restart Claude Desktop completely
3. For CLI, try `claude mcp remove trello-mcp-server` then add again

## Docker Installation (Alternative)

For isolated environments:

```dockerfile
FROM node:18-alpine
RUN npm install -g @cyberdeep/trello-mcp-server-optimize
ENV TRELLO_API_KEY=your_key
ENV TRELLO_TOKEN=your_token
CMD ["npx", "@cyberdeep/trello-mcp-server-optimize"]
```

## Support

- Issues: https://github.com/cyberdeep/trello-mcp-server-optimize/issues
- Documentation: See TROUBLESHOOTING.md for detailed solutions