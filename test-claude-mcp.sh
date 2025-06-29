#!/bin/bash

# Test script to simulate Claude Code MCP interaction

echo "Testing MCP server with Claude Code style communication..."

# Set environment variables
export TRELLO_API_KEY=test_key
export TRELLO_TOKEN=test_token

# Start the server in background
node bin/mcp-server-trello &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Send initialize request without newline first (simulating potential Claude Code behavior)
echo -n '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"0.1.0","capabilities":{},"clientInfo":{"name":"claude-code","version":"1.0.0"}},"id":1}'

# Wait a bit
sleep 1

# Now send newline
echo ""

# Wait for response
sleep 2

# Kill the server
kill $SERVER_PID 2>/dev/null

echo "Test complete"