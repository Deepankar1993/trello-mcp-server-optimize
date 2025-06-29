# Quick Setup Guide for Trello MCP Server

This guide provides the easiest way to install and configure the Trello MCP Server for use with Claude Code.

## Prerequisites

1. **Node.js and npm** installed on your system
2. **Claude CLI** installed (`npm install -g @anthropic-ai/claude-cli`)
3. **Trello API credentials**:
   - Get your API Key from: https://trello.com/app-key
   - Generate a Token from the same page

## Quick Setup

### Recommended Install Method

```bash
# One-line install command
curl -O https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/install.sh && chmod +x install.sh && ./install.sh
```

Or step by step:

```bash
# Download the installer
curl -O https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/install.sh

# Make it executable
chmod +x install.sh

# Run it (use sudo if you get permission errors)
./install.sh
```

The installer will:
1. Install the Trello MCP server globally
2. Prompt you for your Trello API credentials
3. Configure Claude Code automatically

### Alternative Methods

#### Option 1: Cross-Platform Node.js

```bash
npx @cyberdeep/trello-mcp-server-optimize setup
```

Or if you've cloned the repository:

```bash
node setup.js
```

#### Option 2: Manual Download

```bash
# Download the script
curl -O https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/setup-universal.sh
# Make it executable
chmod +x setup-universal.sh
# Run it
./setup-universal.sh
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

### Permission Errors

If you get npm permission errors, you have several options:

1. **Use sudo (Linux/macOS)**:
   ```bash
   sudo npm install -g @cyberdeep/trello-mcp-server-optimize
   ```

2. **Configure npm to use a different directory** (recommended):
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   npm install -g @cyberdeep/trello-mcp-server-optimize
   ```

3. **Fix npm permissions**:
   ```bash
   sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
   ```

### Other Issues

- **Claude CLI not found**: Make sure you've installed it globally with `npm install -g @anthropic-ai/claude-cli`
- **Server not connecting**: Ensure your API credentials are correct and have the necessary permissions

## Security Note

Your API credentials are stored in your Claude Code configuration. Keep them secure and never share them publicly.