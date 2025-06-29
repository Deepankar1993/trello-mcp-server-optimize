import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '../utils/config.js';

export const listCommand = new Command('list')
  .description('List all configured MCP servers')
  .option('-s, --scope <scope>', 'Configuration scope (user or system)', 'user')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    const configManager = new ConfigManager(options.scope);

    try {
      const servers = configManager.listServers();
      const serverNames = Object.keys(servers);

      if (serverNames.length === 0) {
        console.log(chalk.yellow('No MCP servers configured'));
        console.log(chalk.cyan(`\nConfiguration file: ${configManager.getConfigPath()}`));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(servers, null, 2));
        return;
      }

      // Pretty print servers
      console.log(chalk.cyan('Configured MCP Servers:\n'));

      serverNames.forEach((name) => {
        const config = servers[name];
        console.log(chalk.green(`• ${name}`));
        console.log(`  Command: ${chalk.white(config.command)} ${config.args?.join(' ') || ''}`);
        
        if (config.env && Object.keys(config.env).length > 0) {
          console.log(`  Environment:`);
          Object.entries(config.env).forEach(([key, value]) => {
            console.log(`    ${key}=${value}`);
          });
        }
        console.log();
      });

      console.log(chalk.cyan(`Configuration file: ${configManager.getConfigPath()}`));

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });