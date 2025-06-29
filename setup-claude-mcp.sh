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
echo "Adding Trello MCP server to Claude Code..."

# Method 1: Try the direct add-json command
echo "Method 1: Using claude mcp add-json..."
claude mcp add-json trello-optimized --scope user "{
  \"command\": \"npx\",
  \"args\": [\"-y\", \"@cyberdeep/trello-mcp-server-optimize\"],
  \"env\": {
    \"TRELLO_API_KEY\": \"$TRELLO_API_KEY\",
    \"TRELLO_TOKEN\": \"$TRELLO_TOKEN\"
  }
}" 2>&1

# Check if it worked
if claude mcp list 2>&1 | grep -q "trello-optimized"; then
    echo "✓ Successfully added Trello MCP server!"
    echo ""
    echo "The server should now be available in Claude Code."
    echo "You may need to restart Claude Code for changes to take effect."
    exit 0
fi

echo ""
echo "Method 1 may not have saved environment variables properly."
echo ""

# Method 2: Alternative approach using local installation
echo "Method 2: Setting up local installation..."
echo ""

# Create a wrapper script that includes environment variables
WRAPPER_DIR="$HOME/.claude-mcp-wrappers"
mkdir -p "$WRAPPER_DIR"

cat > "$WRAPPER_DIR/trello-mcp-wrapper.sh" << EOF
#!/bin/bash
export TRELLO_API_KEY="$TRELLO_API_KEY"
export TRELLO_TOKEN="$TRELLO_TOKEN"
exec npx -y @cyberdeep/trello-mcp-server-optimize
EOF

chmod +x "$WRAPPER_DIR/trello-mcp-wrapper.sh"

# Add using the wrapper script
echo "Adding server with wrapper script..."
claude mcp add-json trello-optimized-wrapped --scope user "{
  \"command\": \"$WRAPPER_DIR/trello-mcp-wrapper.sh\",
  \"args\": []
}" 2>&1

echo ""
echo "Setup complete!"
echo ""
echo "IMPORTANT: The environment variables might not be saved properly by Claude MCP."
echo ""
echo "Alternative Manual Setup:"
echo "========================"
echo ""
echo "1. Find your Claude Code configuration file:"
echo "   - macOS/Linux: ~/.config/claude/claude_desktop_config.json"
echo "   - Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""
echo "2. Add this configuration manually:"
echo ""
cat << EOF
{
  "mcpServers": {
    "trello-mcp-server": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
      "env": {
        "TRELLO_API_KEY": "$TRELLO_API_KEY",
        "TRELLO_TOKEN": "$TRELLO_TOKEN"
      }
    }
  }
}
EOF
echo ""
echo "3. Restart Claude Code after making changes"
echo ""
echo "For more help, see TROUBLESHOOTING.md"