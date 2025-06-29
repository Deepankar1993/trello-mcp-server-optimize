# Quick Setup Guide for Trello MCP Server

This guide provides the easiest way to install and configure the Trello MCP Server for use with Claude Code.

## Prerequisites

1. **Node.js and npm** installed on your system
2. **Claude CLI** installed (`npm install -g @anthropic-ai/claude-cli`)
3. **Trello API credentials**:
   - Get your API Key from: https://trello.com/app-key
   - Generate a Token from the same page

## One-Command Setup

We provide setup scripts for different platforms:

### Option 1: Cross-Platform (Recommended)

```bash
npx @cyberdeep/trello-mcp-server-optimize setup
```

Or if you've cloned the repository:

```bash
node setup.js
```

### Option 2: Unix/Linux/macOS

```bash
curl -sSL https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/setup-trello-mcp.sh | bash
```

Or if you've cloned the repository:

```bash
./setup-trello-mcp.sh
```

### Option 3: Windows

Download and run `setup-trello-mcp.bat` from the repository, or run:

```cmd
setup-trello-mcp.bat
```

## What the Setup Script Does

1. **Installs the package globally** using npm
2. **Prompts for your Trello credentials** (API Key and Token)
3. **Configures Claude Code** automatically with the correct settings
4. **Verifies the installation** and provides next steps

## Manual Setup (Alternative)

If you prefer to set up manually:

1. Install globally:
   ```bash
   npm install -g @cyberdeep/trello-mcp-server-optimize
   ```

2. Configure Claude Code:
   ```bash
   claude mcp add-json trello-optimized --scope user '{
     "command": "trello-mcp-optimize",
     "args": [],
     "env": {
       "TRELLO_API_KEY": "your_api_key_here",
       "TRELLO_TOKEN": "your_token_here"
     }
   }'
   ```

## Verification

After setup, restart Claude Code and check if "trello-optimized" appears in your MCP servers list with a ✓ connected status.

## Troubleshooting

- **Permission errors**: Run the install command with `sudo` on Unix/macOS or as Administrator on Windows
- **Claude CLI not found**: Make sure you've installed it globally with `npm install -g @anthropic-ai/claude-cli`
- **Server not connecting**: Ensure your API credentials are correct and have the necessary permissions

## Security Note

Your API credentials are stored in your Claude Code configuration. Keep them secure and never share them publicly.