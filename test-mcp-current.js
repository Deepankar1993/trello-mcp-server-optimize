#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP server with current configuration...');

// Test with the build/index.js directly
const serverPath = join(__dirname, 'build', 'index.js');
console.log('Server path:', serverPath);

const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
        ...process.env,
        // No env vars to test graceful handling
    }
});

let responseReceived = false;
let fullResponse = '';

// Capture stdout
serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('STDOUT:', output);
    fullResponse += output;
    responseReceived = true;
});

// Capture stderr
serverProcess.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString());
});

// Handle errors
serverProcess.on('error', (error) => {
    console.log('PROCESS ERROR:', error);
});

// Send initialize request
const initRequest = JSON.stringify({
    jsonrpc: "2.0",
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "test-client",
            version: "1.0.0"
        }
    },
    id: 1
}) + '\n';

console.log('Sending initialize request...');
serverProcess.stdin.write(initRequest);

// Check after 2 seconds
setTimeout(() => {
    if (responseReceived) {
        console.log('\n✅ SUCCESS: Server responded');
        console.log('Full response:', fullResponse);
        
        // Try to parse the response
        try {
            const response = JSON.parse(fullResponse);
            if (response.result) {
                console.log('Server info:', response.result.serverInfo);
            }
        } catch (e) {
            console.log('Could not parse response as JSON');
        }
    } else {
        console.log('\n❌ FAILED: No response received');
    }
    
    serverProcess.kill();
    process.exit(responseReceived ? 0 : 1);
}, 2000);