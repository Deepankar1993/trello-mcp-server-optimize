#!/bin/bash

# Claude MCP Setup Script for Trello MCP Server
# This script helps configure the Trello MCP server with Claude Code

echo "Claude MCP Trello Server Setup"
echo "=============================="
echo ""

# Check if API credentials are provided as arguments
if [ "$#" -eq 2 ]; then
    TRELLO_API_KEY="$1"
    TRELLO_TOKEN="$2"
else
    # Prompt for credentials
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
echo "Configuring Trello MCP server..."

# Find the Claude configuration file
CLAUDE_CONFIG="$HOME/.claude.json"

if [ ! -f "$CLAUDE_CONFIG" ]; then
    echo "Error: Claude configuration file not found at $CLAUDE_CONFIG"
    echo "Please ensure Claude Code is installed and has been run at least once."
    exit 1
fi

# Backup the original config
cp "$CLAUDE_CONFIG" "$CLAUDE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Created backup of configuration file"

# Create the new server configuration
SERVER_CONFIG=$(cat <<EOF
{
  "name": "trello-mcp-server",
  "config": {
    "command": "npx",
    "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
    "env": {
      "TRELLO_API_KEY": "$TRELLO_API_KEY",
      "TRELLO_TOKEN": "$TRELLO_TOKEN"
    }
  }
}
EOF
)

# Use Python to update the JSON file properly
python3 << PYTHON_SCRIPT
import json
import sys

config_file = "$CLAUDE_CONFIG"
server_name = "trello-mcp-server"

try:
    # Read the existing configuration
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    # Ensure userMcpServers exists
    if 'userMcpServers' not in config:
        config['userMcpServers'] = {}
    
    # Add or update our server configuration
    config['userMcpServers'][server_name] = {
        "command": "npx",
        "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
        "env": {
            "TRELLO_API_KEY": "$TRELLO_API_KEY",
            "TRELLO_TOKEN": "$TRELLO_TOKEN"
        }
    }
    
    # Write the updated configuration
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✓ Successfully updated Claude configuration")
    sys.exit(0)
    
except Exception as e:
    print(f"Error updating configuration: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "The Trello MCP server has been added to your Claude configuration with:"
    echo "  - API Key: ${TRELLO_API_KEY:0:10}..."
    echo "  - Token: ${TRELLO_TOKEN:0:10}..."
    echo ""
    echo "IMPORTANT: Restart Claude Code for the changes to take effect."
    echo ""
    echo "The server will be available as 'trello-mcp-server' in Claude Code."
else
    echo ""
    echo "❌ Failed to update configuration automatically."
    echo ""
    echo "Manual Setup Instructions:"
    echo "=========================="
    echo ""
    echo "1. Open the file: $CLAUDE_CONFIG"
    echo ""
    echo "2. Find the \"userMcpServers\" section (or create it if missing)"
    echo ""
    echo "3. Add this configuration:"
    echo ""
    cat << EOF
"trello-mcp-server": {
  "command": "npx",
  "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
  "env": {
    "TRELLO_API_KEY": "$TRELLO_API_KEY",
    "TRELLO_TOKEN": "$TRELLO_TOKEN"
  }
}
EOF
    echo ""
    echo "4. Save the file and restart Claude Code"
fi