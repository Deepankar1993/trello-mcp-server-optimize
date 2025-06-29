#!/bin/bash

# Universal Trello MCP Server Setup Script
# This script handles all permission scenarios automatically

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
    print_color "$YELLOW" "Installing Claude CLI..."
    if command -v sudo &> /dev/null && [ "$EUID" -ne 0 ]; then
        sudo npm install -g @anthropic-ai/claude-cli
    else
        npm install -g @anthropic-ai/claude-cli
    fi
fi

# Install the package globally with proper permissions
print_color "$YELLOW" "Installing Trello MCP Server globally..."

# Determine the best installation method
if [ "$EUID" -eq 0 ]; then
    # Running as root
    npm install -g @cyberdeep/trello-mcp-server-optimize
elif command -v sudo &> /dev/null; then
    # Not root but sudo is available
    sudo npm install -g @cyberdeep/trello-mcp-server-optimize
else
    # Try without sudo
    if ! npm install -g @cyberdeep/trello-mcp-server-optimize 2>/dev/null; then
        print_color "$RED" "Installation failed. Trying alternative method..."
        
        # Set up local npm prefix
        mkdir -p ~/.npm-global
        npm config set prefix '~/.npm-global'
        export PATH=~/.npm-global/bin:$PATH
        
        # Add to shell config if not already there
        SHELL_CONFIG=""
        if [ -f ~/.bashrc ]; then
            SHELL_CONFIG=~/.bashrc
        elif [ -f ~/.zshrc ]; then
            SHELL_CONFIG=~/.zshrc
        fi
        
        if [ -n "$SHELL_CONFIG" ] && ! grep -q ".npm-global/bin" "$SHELL_CONFIG"; then
            echo 'export PATH=~/.npm-global/bin:$PATH' >> "$SHELL_CONFIG"
            print_color "$YELLOW" "Added npm global path to $SHELL_CONFIG"
        fi
        
        # Try installation again
        npm install -g @cyberdeep/trello-mcp-server-optimize
    fi
fi

print_color "$GREEN" "✓ Installation successful!"

echo
print_color "$BLUE" "To use this server, you'll need Trello API credentials."
print_color "$BLUE" "Get them from: https://trello.com/app-key"
echo

# Get API key - handle both TTY and non-TTY scenarios
if [ -t 0 ]; then
    # Interactive mode
    while true; do
        read -p "Enter your Trello API Key: " api_key
        if [ -z "$api_key" ]; then
            print_color "$RED" "API Key cannot be empty. Please try again."
        else
            break
        fi
    done
    
    while true; do
        read -p "Enter your Trello Token: " token
        if [ -z "$token" ]; then
            print_color "$RED" "Token cannot be empty. Please try again."
        else
            break
        fi
    done
else
    # Non-interactive mode (piped) - prompt using stderr
    print_color "$YELLOW" "Running in non-interactive mode. Please provide credentials:"
    exec < /dev/tty
    
    while true; do
        printf "Enter your Trello API Key: " >&2
        read api_key
        if [ -z "$api_key" ]; then
            print_color "$RED" "API Key cannot be empty. Please try again."
        else
            break
        fi
    done
    
    while true; do
        printf "Enter your Trello Token: " >&2
        read token
        if [ -z "$token" ]; then
            print_color "$RED" "Token cannot be empty. Please try again."
        else
            break
        fi
    done
fi

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

# Add or update the configuration in Claude Code
if command -v claude &> /dev/null; then
    # First try to remove existing configuration if it exists
    claude mcp remove trello-optimized --scope user 2>/dev/null || true
    
    # Now add the new configuration
    if claude mcp add-json trello-optimized --scope user "$config_json"; then
        print_color "$GREEN" "✓ Configuration added successfully!"
    else
        print_color "$YELLOW" "Trying to update existing configuration..."
        # If add fails, it might already exist, so let's update it directly
        config_file="$HOME/.config/@anthropic-ai/claude-cli/config.json"
        if [ -f "$config_file" ]; then
            # Create a backup
            cp "$config_file" "$config_file.bak"
            
            # Update the config using a more robust method
            print_color "$YELLOW" "Please run this command manually to update the configuration:"
            echo
            echo "claude mcp remove trello-optimized --scope user"
            echo "claude mcp add-json trello-optimized --scope user '$config_json'"
        else
            print_color "$RED" "✗ Failed to configure Claude Code automatically."
            print_color "$YELLOW" "You can manually add the configuration with:"
            echo
            echo "claude mcp add-json trello-optimized --scope user '$config_json'"
        fi
    fi
else
    print_color "$YELLOW" "Claude CLI not found in PATH after installation."
    print_color "$YELLOW" "You may need to restart your terminal or run:"
    echo "source ~/.bashrc"
    echo
    print_color "$YELLOW" "Then run this command manually:"
    echo "claude mcp add-json trello-optimized --scope user '$config_json'"
fi

# Success message
echo
print_color "$GREEN" "================================================"
print_color "$GREEN" "  Setup Complete! 🎉"
print_color "$GREEN" "================================================"
echo
print_color "$BLUE" "The Trello MCP Server has been installed."
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

# Check if PATH needs to be reloaded
if [ -d ~/.npm-global/bin ] && [[ ":$PATH:" != *":$HOME/.npm-global/bin:"* ]]; then
    echo
    print_color "$YELLOW" "Note: You may need to restart your terminal or run:"
    echo "source ~/.bashrc"
fi