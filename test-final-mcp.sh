#!/bin/bash

echo "Testing Trello MCP Server..."
echo ""

# Test 1: Direct execution
echo "1. Testing direct execution..."
timeout 2 node build/index.js < /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ Direct execution works (timed out waiting for input)"
else
    echo "❌ Direct execution failed"
fi

# Test 2: NPX execution
echo ""
echo "2. Testing npx execution..."
timeout 2 npx -y @cyberdeep/trello-mcp-server-optimize@latest < /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ NPX execution works (timed out waiting for input)"
else
    echo "❌ NPX execution failed"
fi

# Test 3: Check executable
echo ""
echo "3. Checking if build/index.js is executable..."
if [ -x build/index.js ]; then
    echo "✅ build/index.js is executable"
else
    echo "❌ build/index.js is not executable"
fi

echo ""
echo "Claude Code configuration:"
cat << EOF
{
  "mcpServers": {
    "trello-optimized": {
      "command": "npx",
      "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
      "env": {
        "TRELLO_API_KEY": "your_api_key",
        "TRELLO_TOKEN": "your_token"
      }
    }
  }
}
EOF