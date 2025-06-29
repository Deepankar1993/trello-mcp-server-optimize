#!/bin/bash

# Trello MCP Server Setup Script for Claude Code
# This script automates the installation and configuration process

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
    print_color "$YELLOW" "Please install it first: npm install -g @anthropic-ai/claude-cli"
    exit 1
fi

# Install the package globally
print_color "$YELLOW" "Installing Trello MCP Server globally..."

# Try to install without sudo first
if npm install -g @cyberdeep/trello-mcp-server-optimize 2>/dev/null; then
    print_color "$GREEN" "✓ Installation successful!"
else
    # If that fails, check if we can use sudo
    if [ "$EUID" -ne 0 ] && command -v sudo &> /dev/null; then
        print_color "$YELLOW" "Installation requires elevated permissions. Attempting with sudo..."
        if sudo npm install -g @cyberdeep/trello-mcp-server-optimize; then
            print_color "$GREEN" "✓ Installation successful!"
        else
            print_color "$RED" "✗ Installation failed even with sudo."
            print_color "$YELLOW" "Try running: sudo npm install -g @cyberdeep/trello-mcp-server-optimize"
            exit 1
        fi
    else
        print_color "$RED" "✗ Installation failed. Please check your npm permissions."
        print_color "$YELLOW" "Try one of these commands:"
        echo "  1. sudo npm install -g @cyberdeep/trello-mcp-server-optimize"
        echo "  2. npm config set prefix ~/.npm-global && npm install -g @cyberdeep/trello-mcp-server-optimize"
        exit 1
    fi
fi

echo
print_color "$BLUE" "To use this server, you'll need Trello API credentials."
print_color "$BLUE" "Get them from: https://trello.com/app-key"
echo

# Get API key
while true; do
    read -p "Enter your Trello API Key: " api_key
    if [ -z "$api_key" ]; then
        print_color "$RED" "API Key cannot be empty. Please try again."
    else
        break
    fi
done

# Get Token
while true; do
    read -p "Enter your Trello Token: " token
    if [ -z "$token" ]; then
        print_color "$RED" "Token cannot be empty. Please try again."
    else
        break
    fi
done

# Configure Claude Code
echo
print_color "$YELLOW" "Configuring Claude Code..."

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
    print_color "$YELLOW" "You can manually add the configuration with:"
    echo
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
print_color "$YELLOW" "Available tools include:"
echo "  - get_boards: List all your Trello boards"
echo "  - get_board_lists: Get lists from a board"
echo "  - get_cards_in_list: Get cards from a list"
echo "  - create_card: Create new cards"
echo "  - And many more!"
echo
print_color "$BLUE" "To verify the installation, restart Claude Code and check"
print_color "$BLUE" "if 'trello-optimized' appears in your MCP servers list."