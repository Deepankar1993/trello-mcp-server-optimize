import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '../utils/config.js';

export const removeCommand = new Command('remove')
  .description('Remove an MCP server from Claude Desktop')
  .argument('[name]', 'Name of the server to remove')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (serverName: string | undefined, options) => {
    const configManager = new ConfigManager();

    try {
      // If no name provided, show interactive list
      if (!serverName) {
        const servers = configManager.listServers();
        const serverNames = Object.keys(servers);

        if (serverNames.length === 0) {
          console.log(chalk.yellow('No MCP servers configured'));
          return;
        }

        const { selectedServer } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedServer',
            message: 'Select server to remove:',
            choices: serverNames
          }
        ]);

        serverName = selectedServer;
      }

      // Check if server exists
      const serverConfig = configManager.getServer(serverName!);
      if (!serverConfig) {
        throw new Error(`Server '${serverName}' not found`);
      }

      // Confirm removal
      if (!options.yes) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Remove server '${serverName}'?`,
            default: false
          }
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Cancelled'));
          return;
        }
      }

      // Remove server
      configManager.removeServer(serverName!);
      
      console.log(chalk.green(`✓ Removed '${serverName}' from Claude Desktop configuration`));
      console.log(chalk.yellow('\nRestart Claude Desktop for changes to take effect.'));

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });