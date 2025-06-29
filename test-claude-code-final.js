#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing MCP server startup like Claude Code...');

// Simulate how Claude Code might start the server
const serverProcess = spawn('node', ['bin/mcp-server-trello'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
        ...process.env,
        // Claude Code would set these if configured
        // TRELLO_API_KEY: 'xxx',
        // TRELLO_TOKEN: 'xxx'
    }
});

let responseReceived = false;

// Capture stdout
serverProcess.stdout.on('data', (data) => {
    console.log('STDOUT:', data.toString());
    responseReceived = true;
});

// Handle errors
serverProcess.on('error', (error) => {
    console.log('PROCESS ERROR:', error);
});

// Capture stderr
serverProcess.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString());
});

// Send initialize immediately
const initRequest = JSON.stringify({
    jsonrpc: "2.0",
    method: "initialize",
    params: {
        protocolVersion: "0.1.0",
        capabilities: {},
        clientInfo: {
            name: "claude-code",
            version: "1.0.0"
        }
    },
    id: 1
}) + '\n';

console.log('Sending:', initRequest.trim());
serverProcess.stdin.write(initRequest);

// Check after 1 second
setTimeout(() => {
    if (responseReceived) {
        console.log('\n✅ SUCCESS: Server responded correctly');
    } else {
        console.log('\n❌ FAILED: No response received');
    }
    serverProcess.kill();
    process.exit(responseReceived ? 0 : 1);
}, 1000);