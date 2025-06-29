#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing published package with MCP protocol...\n');

const child = spawn('npx', ['-y', '@cyberdeep/trello-mcp-server-optimize@latest'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

child.stdout.on('data', (data) => {
    const response = data.toString();
    console.log('Response:', response);
    responseReceived = true;
    
    try {
        const json = JSON.parse(response);
        if (json.result && json.result.serverInfo) {
            console.log('\n✅ SUCCESS: Server responded correctly');
            console.log('Server:', json.result.serverInfo.name);
            console.log('Version:', json.result.serverInfo.version);
        }
    } catch (e) {
        // Not JSON, ignore
    }
});

child.stderr.on('data', (data) => {
    const stderr = data.toString();
    if (stderr.includes('not found')) {
        console.error('❌ ERROR:', stderr);
    }
});

// Send initialize request
const request = JSON.stringify({
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

setTimeout(() => {
    console.log('Sending initialize request...');
    child.stdin.write(request);
}, 1000);

setTimeout(() => {
    if (!responseReceived) {
        console.log('\n❌ FAILED: No response received');
    }
    child.kill();
    process.exit(responseReceived ? 0 : 1);
}, 3000);