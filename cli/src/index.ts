#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { listCommand } from './commands/list.js';
import { validateCommand } from './commands/validate.js';
import { packageInfo } from './utils/package.js';

const program = new Command();

program
  .name('claude-mcp')
  .description('CLI tool for managing MCP servers in Claude Desktop')
  .version(packageInfo.version)
  .addHelpText('after', `
${chalk.cyan('Examples:')}
  $ claude-mcp add trello-mcp-server
  $ claude-mcp add-json ./my-server-config.json
  $ claude-mcp list
  $ claude-mcp remove trello-mcp-server
  
${chalk.cyan('For more information:')}
  https://github.com/Deepankar1993/trello-mcp-server-optimize/cli
`);

// Add commands
program.addCommand(addCommand);
program.addCommand(removeCommand);
program.addCommand(listCommand);
program.addCommand(validateCommand);

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}