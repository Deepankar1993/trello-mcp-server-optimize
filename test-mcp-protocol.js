#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Test MCP protocol communication
async function testMCPServer() {
    console.log('Starting MCP server test...');
    
    // Spawn the MCP server
    const serverProcess = spawn('node', ['bin/mcp-server-trello'], {
        env: {
            ...process.env,
            TRELLO_API_KEY: 'test_key',
            TRELLO_TOKEN: 'test_token'
        }
    });

    // Create readline interface for reading stdout
    const rl = createInterface({
        input: serverProcess.stdout,
        crlfDelay: Infinity
    });

    // Handle stderr
    serverProcess.stderr.on('data', (data) => {
        console.error('Server stderr:', data.toString());
    });

    // Handle stdout lines
    rl.on('line', (line) => {
        console.log('Server response:', line);
        try {
            const response = JSON.parse(line);
            console.log('Parsed response:', JSON.stringify(response, null, 2));
        } catch (e) {
            // Not JSON, ignore
        }
    });

    // Handle server exit
    serverProcess.on('exit', (code) => {
        console.log(`Server exited with code ${code}`);
    });

    // Send initialize request
    const initializeRequest = {
        jsonrpc: "2.0",
        method: "initialize",
        params: {
            protocolVersion: "0.1.0",
            capabilities: {},
            clientInfo: {
                name: "test-client",
                version: "1.0.0"
            }
        },
        id: 1
    };

    console.log('Sending initialize request...');
    serverProcess.stdin.write(JSON.stringify(initializeRequest) + '\n');

    // Wait a bit for response
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send list tools request
    const listToolsRequest = {
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: 2
    };

    console.log('Sending list tools request...');
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean shutdown
    console.log('Shutting down server...');
    serverProcess.kill('SIGINT');
}

// Run the test
testMCPServer().catch(console.error);