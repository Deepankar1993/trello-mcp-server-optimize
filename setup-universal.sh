#!/bin/bash

# Universal Setup Script for Trello MCP Server
# Works on WSL, Linux, and macOS for both Claude CLI and Claude Desktop

set -e

echo "Universal Trello MCP Server Setup"
echo "================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ -f /proc/version ]] && grep -qi microsoft /proc/version; then
    OS="WSL"
else
    OS="Linux"
fi

echo "Detected OS: $OS"
echo ""

# Get credentials
if [ "$#" -eq 2 ]; then
    TRELLO_API_KEY="$1"
    TRELLO_TOKEN="$2"
else
    echo "Please provide your Trello API credentials"
    echo "Get them from: https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/"
    echo ""
    read -p "Enter your Trello API Key: " TRELLO_API_KEY
    read -p "Enter your Trello Token: " TRELLO_TOKEN
fi

# Validate inputs
if [ -z "$TRELLO_API_KEY" ] || [ -z "$TRELLO_TOKEN" ]; then
    echo "Error: Both API Key and Token are required"
    exit 1
fi

echo ""
echo "Choose installation type:"
echo "1. Claude Desktop (Claude Code)"
echo "2. Claude CLI"
echo "3. Both"
echo ""
read -p "Enter your choice (1-3): " INSTALL_CHOICE

# Function to setup Claude Desktop
setup_claude_desktop() {
    echo ""
    echo "Setting up for Claude Desktop..."
    
    # Find Claude config file
    CLAUDE_CONFIG=""
    if [ -f "$HOME/.claude.json" ]; then
        CLAUDE_CONFIG="$HOME/.claude.json"
    elif [ "$OS" == "macOS" ] && [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
        CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    elif [ "$OS" == "WSL" ] || [ "$OS" == "Linux" ]; then
        # Check common locations
        if [ -f "$HOME/.config/claude/claude_desktop_config.json" ]; then
            CLAUDE_CONFIG="$HOME/.config/claude/claude_desktop_config.json"
        fi
    fi
    
    if [ -z "$CLAUDE_CONFIG" ] || [ ! -f "$CLAUDE_CONFIG" ]; then
        echo "Warning: Claude Desktop configuration file not found."
        echo "Please ensure Claude Desktop is installed and has been run at least once."
        echo ""
        echo "Expected locations:"
        echo "  - $HOME/.claude.json"
        echo "  - macOS: $HOME/Library/Application Support/Claude/claude_desktop_config.json"
        echo "  - Linux/WSL: $HOME/.config/claude/claude_desktop_config.json"
        return 1
    fi
    
    echo "Found config at: $CLAUDE_CONFIG"
    
    # Backup config
    cp "$CLAUDE_CONFIG" "$CLAUDE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✓ Created backup"
    
    # Update config using Python
    python3 << PYTHON_SCRIPT
import json
import sys

config_file = "$CLAUDE_CONFIG"

try:
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    # Handle different config structures
    servers_key = None
    if 'userMcpServers' in config:
        servers_key = 'userMcpServers'
    elif 'mcpServers' in config:
        servers_key = 'mcpServers'
    else:
        # Create the appropriate key based on file type
        if '.claude.json' in config_file:
            servers_key = 'userMcpServers'
        else:
            servers_key = 'mcpServers'
        config[servers_key] = {}
    
    # Add server configuration
    config[servers_key]['trello-mcp-server'] = {
        "command": "npx",
        "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
        "env": {
            "TRELLO_API_KEY": "$TRELLO_API_KEY",
            "TRELLO_TOKEN": "$TRELLO_TOKEN"
        }
    }
    
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✓ Successfully updated Claude Desktop configuration")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT
    
    if [ $? -eq 0 ]; then
        echo "✓ Claude Desktop setup complete"
        return 0
    else
        return 1
    fi
}

# Function to setup Claude CLI
setup_claude_cli() {
    echo ""
    echo "Setting up for Claude CLI..."
    
    # Check if claude CLI is installed
    if ! command -v claude &> /dev/null; then
        echo "Error: Claude CLI not found. Please install it first:"
        echo "  npm install -g @anthropic-ai/claude-cli"
        return 1
    fi
    
    # Create a wrapper script for CLI (since env vars don't work with CLI)
    WRAPPER_DIR="$HOME/.claude-mcp-wrappers"
    mkdir -p "$WRAPPER_DIR"
    
    cat > "$WRAPPER_DIR/trello-mcp-cli.sh" << EOF
#!/bin/bash
export TRELLO_API_KEY="$TRELLO_API_KEY"
export TRELLO_TOKEN="$TRELLO_TOKEN"
exec npx -y @cyberdeep/trello-mcp-server-optimize
EOF
    
    chmod +x "$WRAPPER_DIR/trello-mcp-cli.sh"
    
    # Add to Claude CLI
    echo "Adding to Claude CLI..."
    claude mcp add trello-mcp-server "$WRAPPER_DIR/trello-mcp-cli.sh" --scope user
    
    if [ $? -eq 0 ]; then
        echo "✓ Claude CLI setup complete"
        return 0
    else
        echo "Error: Failed to add to Claude CLI"
        return 1
    fi
}

# Execute based on choice
case $INSTALL_CHOICE in
    1)
        setup_claude_desktop
        ;;
    2)
        setup_claude_cli
        ;;
    3)
        setup_claude_desktop
        setup_claude_cli
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Setup Summary"
echo "========================================="
echo ""

if [[ $INSTALL_CHOICE == "1" ]] || [[ $INSTALL_CHOICE == "3" ]]; then
    echo "Claude Desktop:"
    echo "  - Server name: trello-mcp-server"
    echo "  - Restart Claude Desktop to apply changes"
    echo ""
fi

if [[ $INSTALL_CHOICE == "2" ]] || [[ $INSTALL_CHOICE == "3" ]]; then
    echo "Claude CLI:"
    echo "  - Server name: trello-mcp-server"
    echo "  - Wrapper script: $HOME/.claude-mcp-wrappers/trello-mcp-cli.sh"
    echo "  - Test with: claude mcp list"
    echo ""
fi

echo "Credentials configured:"
echo "  - API Key: ${TRELLO_API_KEY:0:10}..."
echo "  - Token: ${TRELLO_TOKEN:0:10}..."
echo ""
echo "For troubleshooting, see TROUBLESHOOTING.md"