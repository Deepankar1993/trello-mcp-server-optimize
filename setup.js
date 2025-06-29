#!/usr/bin/env node

/**
 * Cross-platform setup script for Trello MCP Server
 * Works on Windows, macOS, and Linux
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Helper function to print colored output
function print(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Check if a command exists
function commandExists(command) {
    try {
        execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// Main setup function
async function setup() {
    print('================================================', 'blue');
    print('  Trello MCP Server Setup for Claude Code', 'blue');
    print('================================================', 'blue');
    console.log();

    // Check prerequisites
    if (!commandExists('npm')) {
        print('Error: npm is not installed. Please install Node.js and npm first.', 'red');
        process.exit(1);
    }

    if (!commandExists('claude')) {
        print('Error: Claude CLI is not installed.', 'red');
        print('Please install it first: npm install -g @anthropic-ai/claude-cli', 'yellow');
        process.exit(1);
    }

    // Install the package globally
    print('Installing Trello MCP Server globally...', 'yellow');
    try {
        execSync('npm install -g @cyberdeep/trello-mcp-server-optimize', { stdio: 'inherit' });
        print('✓ Installation successful!', 'green');
    } catch (error) {
        print('✗ Installation failed. Please check your npm permissions.', 'red');
        process.exit(1);
    }

    console.log();
    print('To use this server, you\'ll need Trello API credentials.', 'blue');
    print('Get them from: https://trello.com/app-key', 'blue');
    console.log();

    // Get API credentials
    let apiKey = '';
    while (!apiKey) {
        apiKey = await prompt('Enter your Trello API Key: ');
        if (!apiKey) {
            print('API Key cannot be empty. Please try again.', 'red');
        }
    }

    let token = '';
    while (!token) {
        token = await prompt('Enter your Trello Token: ');
        if (!token) {
            print('Token cannot be empty. Please try again.', 'red');
        }
    }

    // Configure Claude Code
    console.log();
    print('Configuring Claude Code...', 'yellow');

    const config = {
        command: 'trello-mcp-optimize',
        args: [],
        env: {
            TRELLO_API_KEY: apiKey,
            TRELLO_TOKEN: token
        }
    };

    try {
        const configJson = JSON.stringify(config);
        
        // Use spawn to handle the command properly on all platforms
        const claudeProcess = spawn('claude', ['mcp', 'add-json', 'trello-optimized', '--scope', 'user', configJson], {
            shell: true,
            stdio: 'inherit'
        });

        await new Promise((resolve, reject) => {
            claudeProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
            claudeProcess.on('error', reject);
        });

        print('✓ Configuration added successfully!', 'green');
    } catch (error) {
        print('✗ Failed to configure Claude Code.', 'red');
        print('You can manually add the configuration with:', 'yellow');
        console.log();
        console.log(`claude mcp add-json trello-optimized --scope user '${JSON.stringify(config)}'`);
        process.exit(1);
    }

    // Success message
    console.log();
    print('================================================', 'green');
    print('  Setup Complete! 🎉', 'green');
    print('================================================', 'green');
    console.log();
    print('The Trello MCP Server has been installed and configured.', 'blue');
    print('You can now use Trello tools in Claude Code!', 'blue');
    console.log();
    print('Available tools include:', 'yellow');
    console.log('  - get_boards: List all your Trello boards');
    console.log('  - get_board_lists: Get lists from a board');
    console.log('  - get_cards_in_list: Get cards from a list');
    console.log('  - create_card: Create new cards');
    console.log('  - And many more!');
    console.log();
    print('To verify the installation, restart Claude Code and check', 'blue');
    print('if \'trello-optimized\' appears in your MCP servers list.', 'blue');

    rl.close();
}

// Run setup
setup().catch((error) => {
    print(`Setup failed: ${error.message}`, 'red');
    process.exit(1);
});