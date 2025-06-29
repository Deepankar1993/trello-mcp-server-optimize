#!/bin/bash

# Trello MCP Server Installer
# This script must be run directly, not piped

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Check if script is being piped
if [ ! -t 0 ]; then
    print_color "$RED" "Error: This script cannot be piped. Please run it directly."
    print_color "$YELLOW" "Download and run like this:"
    echo "  curl -O https://raw.githubusercontent.com/Deepankar1993/trello-mcp-server-optimize/master/install.sh"
    echo "  chmod +x install.sh"
    echo "  ./install.sh"
    exit 1
fi

# Header
print_color "$BLUE" "================================================"
print_color "$BLUE" "  Trello MCP Server Setup for Claude Code"
print_color "$BLUE" "================================================"
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_color "$RED" "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if claude CLI is installed
if ! command -v claude &> /dev/null; then
    print_color "$RED" "Error: Claude CLI is not installed."
    print_color "$YELLOW" "Installing Claude CLI..."
    if [ "$EUID" -ne 0 ] && command -v sudo &> /dev/null; then
        sudo npm install -g @anthropic-ai/claude-cli
    else
        npm install -g @anthropic-ai/claude-cli
    fi
fi

# Install the package globally
print_color "$YELLOW" "Installing Trello MCP Server globally..."

if [ "$EUID" -eq 0 ]; then
    # Running as root
    npm install -g @cyberdeep/trello-mcp-server-optimize
elif command -v sudo &> /dev/null; then
    # Not root but sudo is available
    sudo npm install -g @cyberdeep/trello-mcp-server-optimize
else
    # Try without sudo
    npm install -g @cyberdeep/trello-mcp-server-optimize || {
        print_color "$RED" "Installation failed. You may need sudo permissions."
        print_color "$YELLOW" "Try: sudo ./install.sh"
        exit 1
    }
fi

print_color "$GREEN" "✓ Installation successful!"

echo
print_color "$BLUE" "To use this server, you'll need Trello API credentials."
print_color "$BLUE" "Get them from: https://trello.com/app-key"
echo

# Get API key
api_key=""
while [ -z "$api_key" ]; do
    read -p "Enter your Trello API Key: " api_key
    if [ -z "$api_key" ]; then
        print_color "$RED" "API Key cannot be empty. Please try again."
    fi
done

# Get Token
token=""
while [ -z "$token" ]; do
    read -p "Enter your Trello Token: " token
    if [ -z "$token" ]; then
        print_color "$RED" "Token cannot be empty. Please try again."
    fi
done

# Configure Claude Code
echo
print_color "$YELLOW" "Configuring Claude Code..."

# Remove existing configuration if it exists
claude mcp remove trello-optimized --scope user 2>/dev/null || true

# Create the configuration JSON
config_json=$(cat <<EOF
{
  "command": "trello-mcp-optimize",
  "args": [],
  "env": {
    "TRELLO_API_KEY": "$api_key",
    "TRELLO_TOKEN": "$token"
  }
}
EOF
)

# Add the configuration to Claude Code
if claude mcp add-json trello-optimized --scope user "$config_json"; then
    print_color "$GREEN" "✓ Configuration added successfully!"
else
    print_color "$RED" "✗ Failed to configure Claude Code."
    print_color "$YELLOW" "Try running these commands manually:"
    echo
    echo "claude mcp remove trello-optimized --scope user"
    echo "claude mcp add-json trello-optimized --scope user '$config_json'"
    exit 1
fi

# Success message
echo
print_color "$GREEN" "================================================"
print_color "$GREEN" "  Setup Complete! 🎉"
print_color "$GREEN" "================================================"
echo
print_color "$BLUE" "The Trello MCP Server has been installed and configured."
print_color "$BLUE" "You can now use Trello tools in Claude Code!"
echo
print_color "$YELLOW" "To verify: Run 'claude mcp list' and look for 'trello-optimized'"
echo
print_color "$BLUE" "Available tools include:"
echo "  - get_boards: List all your Trello boards"
echo "  - get_board_lists: Get lists from a board"
echo "  - get_cards_in_list: Get cards from a list"
echo "  - create_card: Create new cards"
echo "  - And many more!"