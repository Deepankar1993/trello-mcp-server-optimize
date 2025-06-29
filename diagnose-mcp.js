#!/usr/bin/env node

import { spawn } from 'child_process';
import { execSync } from 'child_process';

console.log('MCP Server Diagnostics\n');

// Check npm package
console.log('1. Checking npm package...');
try {
    const packageInfo = execSync('npm view @cyberdeep/trello-mcp-server-optimize@latest', { encoding: 'utf-8' });
    console.log('✅ Package found on npm');
    console.log('Latest version:', packageInfo.match(/latest: ([\d.]+)/)?.[1] || 'unknown');
} catch (e) {
    console.log('❌ Package not found on npm');
}

// Check npx execution
console.log('\n2. Testing npx execution...');
const npxProcess = spawn('npx', ['-y', '@cyberdeep/trello-mcp-server-optimize'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env
});

let npxStarted = false;
let npxError = '';

npxProcess.on('spawn', () => {
    npxStarted = true;
    console.log('✅ npx process spawned successfully');
});

npxProcess.on('error', (err) => {
    console.log('❌ npx error:', err.message);
    npxError = err.message;
});

npxProcess.stderr.on('data', (data) => {
    const stderr = data.toString();
    if (stderr.includes('not found')) {
        console.log('❌ Executable not found:', stderr);
    }
});

// Test MCP protocol
setTimeout(() => {
    if (npxStarted && !npxError) {
        console.log('\n3. Testing MCP protocol...');
        
        const initRequest = JSON.stringify({
            jsonrpc: "2.0",
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "diagnostic-tool",
                    version: "1.0.0"
                }
            },
            id: 1
        }) + '\n';
        
        npxProcess.stdin.write(initRequest);
        
        let responded = false;
        npxProcess.stdout.on('data', (data) => {
            responded = true;
            console.log('✅ Server responded to MCP protocol');
            console.log('Response:', data.toString().trim());
        });
        
        setTimeout(() => {
            if (!responded) {
                console.log('❌ No MCP protocol response');
            }
            
            console.log('\n4. Configuration for Claude Code:');
            console.log(JSON.stringify({
                "mcpServers": {
                    "trello-optimized": {
                        "command": "npx",
                        "args": ["-y", "@cyberdeep/trello-mcp-server-optimize"],
                        "env": {
                            "TRELLO_API_KEY": "your_api_key_here",
                            "TRELLO_TOKEN": "your_token_here"
                        }
                    }
                }
            }, null, 2));
            
            npxProcess.kill();
            process.exit(0);
        }, 2000);
    } else {
        console.log('\n❌ npx failed to start properly');
        process.exit(1);
    }
}, 1000);