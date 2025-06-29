import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { ConfigManager } from '../utils/config.js';

export const validateCommand = new Command('validate')
  .description('Validate MCP server configurations')
  .argument('[name]', 'Name of specific server to validate')
  .action(async (serverName: string | undefined) => {
    const configManager = new ConfigManager();
    const spinner = ora();

    try {
      const servers = configManager.listServers();
      
      if (Object.keys(servers).length === 0) {
        console.log(chalk.yellow('No MCP servers configured'));
        return;
      }

      // Validate specific server or all servers
      const serversToValidate = serverName 
        ? { [serverName]: servers[serverName] || null }
        : servers;

      if (serverName && !serversToValidate[serverName]) {
        throw new Error(`Server '${serverName}' not found`);
      }

      console.log(chalk.cyan('Validating MCP server configurations...\n'));

      for (const [name, config] of Object.entries(serversToValidate)) {
        if (!config) continue;

        spinner.start(`Validating ${name}...`);

        try {
          // Check if command exists
          await execa('which', [config.command]);
          
          // Try to get version or help info
          const args = [...(config.args || []), '--version'];
          const { stdout, stderr } = await execa(config.command, args, {
            timeout: 5000,
            reject: false,
            env: config.env
          });

          if (stdout || stderr) {
            spinner.succeed(`${name}: ${chalk.green('✓ Valid')}`);
          } else {
            spinner.warn(`${name}: ${chalk.yellow('⚠ Command found but could not verify')}`);
          }

        } catch (error: any) {
          if (error.code === 'ENOENT') {
            spinner.fail(`${name}: ${chalk.red('✗ Command not found')}`);
          } else {
            spinner.fail(`${name}: ${chalk.red('✗ Error:')} ${error.message}`);
          }
        }
      }

      console.log(chalk.cyan(`\nConfiguration file: ${configManager.getConfigPath()}`));

    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });