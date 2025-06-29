import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync, readJsonSync } from 'fs-extra';
import { join, resolve } from 'path';
import { execa } from 'execa';
import { ConfigManager, MCPServerConfig } from '../utils/config.js';

export const addCommand = new Command('add')
  .description('Add an MCP server to Claude Desktop')
  .argument('[package]', 'NPM package name or path to JSON config')
  .option('-n, --name <name>', 'Custom name for the server')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--no-install', 'Skip NPM installation (for local packages)')
  .action(async (packageName: string | undefined, options) => {
    const spinner = ora();
    const configManager = new ConfigManager();

    try {
      // Handle add-json subcommand
      if (packageName?.endsWith('.json')) {
        await addJsonConfig(packageName, options, configManager, spinner);
        return;
      }

      // Handle NPM package
      if (packageName) {
        await addNpmPackage(packageName, options, configManager, spinner);
        return;
      }

      // Interactive mode
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'What type of MCP server do you want to add?',
          choices: [
            { name: 'NPM Package', value: 'npm' },
            { name: 'JSON Configuration', value: 'json' },
            { name: 'Manual Configuration', value: 'manual' }
          ]
        }
      ]);

      switch (answers.type) {
        case 'npm':
          const { packageName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'packageName',
              message: 'Enter the NPM package name:',
              validate: (input) => input.trim() !== '' || 'Package name is required'
            }
          ]);
          await addNpmPackage(packageName, options, configManager, spinner);
          break;

        case 'json':
          const { jsonPath } = await inquirer.prompt([
            {
              type: 'input',
              name: 'jsonPath',
              message: 'Enter the path to the JSON configuration file:',
              validate: (input) => existsSync(input) || 'File does not exist'
            }
          ]);
          await addJsonConfig(jsonPath, options, configManager, spinner);
          break;

        case 'manual':
          await addManualConfig(options, configManager);
          break;
      }
    } catch (error: any) {
      spinner.fail(chalk.red(error.message));
      process.exit(1);
    }
  });

// Add subcommand for JSON files
addCommand
  .command('add-json <jsonFile>')
  .description('Add an MCP server from a JSON configuration file')
  .option('-n, --name <name>', 'Custom name for the server')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (jsonFile: string, options) => {
    const spinner = ora();
    const configManager = new ConfigManager();
    
    try {
      await addJsonConfig(jsonFile, options, configManager, spinner);
    } catch (error: any) {
      spinner.fail(chalk.red(error.message));
      process.exit(1);
    }
  });

async function addNpmPackage(
  packageName: string,
  options: any,
  configManager: ConfigManager,
  spinner: ReturnType<typeof ora>
) {
  const serverName = options.name || packageName;

  // Check if already exists
  if (configManager.getServer(serverName)) {
    throw new Error(`Server '${serverName}' already exists`);
  }

  // Install package if needed
  if (!options.noInstall) {
    spinner.start(`Installing ${packageName}...`);
    try {
      await execa('npm', ['install', '-g', packageName]);
      spinner.succeed(`Installed ${packageName}`);
    } catch (error) {
      spinner.fail(`Failed to install ${packageName}`);
      throw error;
    }
  }

  // Get package info
  spinner.start('Configuring MCP server...');
  
  // Default configuration for NPM packages
  const serverConfig: MCPServerConfig = {
    command: 'npx',
    args: [packageName]
  };

  // Check if package has MCP config
  try {
    const { stdout } = await execa('npm', ['view', packageName, 'mcp', '--json']);
    if (stdout) {
      const mcpConfig = JSON.parse(stdout);
      if (mcpConfig.command) serverConfig.command = mcpConfig.command;
      if (mcpConfig.args) serverConfig.args = mcpConfig.args;
      if (mcpConfig.env) serverConfig.env = mcpConfig.env;
    }
  } catch {
    // Package doesn't have MCP config, use defaults
  }

  // Confirm before adding
  if (!options.yes) {
    spinner.stop();
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Add ${serverName} with command: ${serverConfig.command} ${serverConfig.args?.join(' ')}?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Cancelled'));
      return;
    }
  }

  // Add to config
  configManager.addServer(serverName, serverConfig);
  spinner.succeed(`Added ${serverName} to Claude Desktop configuration`);
  
  console.log(chalk.green('\n✓ Server added successfully!'));
  console.log(chalk.cyan(`Configuration file: ${configManager.getConfigPath()}`));
  console.log(chalk.yellow('\nRestart Claude Desktop for changes to take effect.'));
}

async function addJsonConfig(
  jsonPath: string,
  options: any,
  configManager: ConfigManager,
  spinner: ReturnType<typeof ora>
) {
  const absolutePath = resolve(jsonPath);
  
  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  spinner.start('Reading JSON configuration...');
  
  let jsonConfig: any;
  try {
    jsonConfig = readJsonSync(absolutePath);
  } catch (error) {
    spinner.fail('Invalid JSON file');
    throw error;
  }

  // Validate JSON structure
  if (!jsonConfig.command) {
    throw new Error('JSON must contain a "command" field');
  }

  const serverName = options.name || jsonConfig.name || 'custom-mcp-server';
  
  // Check if already exists
  if (configManager.getServer(serverName)) {
    throw new Error(`Server '${serverName}' already exists`);
  }

  const serverConfig: MCPServerConfig = {
    command: jsonConfig.command,
    args: jsonConfig.args || [],
    env: jsonConfig.env || {}
  };

  // Confirm before adding
  if (!options.yes) {
    spinner.stop();
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Add ${serverName} from ${jsonPath}?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Cancelled'));
      return;
    }
  }

  // Add to config
  configManager.addServer(serverName, serverConfig);
  spinner.succeed(`Added ${serverName} to Claude Desktop configuration`);
  
  console.log(chalk.green('\n✓ Server added successfully!'));
  console.log(chalk.cyan(`Configuration file: ${configManager.getConfigPath()}`));
  console.log(chalk.yellow('\nRestart Claude Desktop for changes to take effect.'));
}

async function addManualConfig(
  options: any,
  configManager: ConfigManager
) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Server name:',
      validate: (input) => {
        if (!input.trim()) return 'Name is required';
        if (configManager.getServer(input)) return 'Server already exists';
        return true;
      }
    },
    {
      type: 'input',
      name: 'command',
      message: 'Command to run:',
      validate: (input) => input.trim() !== '' || 'Command is required'
    },
    {
      type: 'input',
      name: 'args',
      message: 'Arguments (space-separated):',
      filter: (input) => input.trim() ? input.trim().split(/\s+/) : []
    },
    {
      type: 'confirm',
      name: 'hasEnv',
      message: 'Do you need to set environment variables?',
      default: false
    }
  ]);

  const serverConfig: MCPServerConfig = {
    command: answers.command,
    args: answers.args.length > 0 ? answers.args : undefined
  };

  // Add environment variables if needed
  if (answers.hasEnv) {
    const env: Record<string, string> = {};
    let addMore = true;

    while (addMore) {
      const envAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'key',
          message: 'Environment variable name:',
          validate: (input) => input.trim() !== '' || 'Name is required'
        },
        {
          type: 'input',
          name: 'value',
          message: 'Environment variable value:',
          validate: (input) => input.trim() !== '' || 'Value is required'
        },
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add another environment variable?',
          default: false
        }
      ]);

      env[envAnswer.key] = envAnswer.value;
      addMore = envAnswer.addMore;
    }

    serverConfig.env = env;
  }

  // Add to config
  configManager.addServer(answers.name, serverConfig);
  
  console.log(chalk.green('\n✓ Server added successfully!'));
  console.log(chalk.cyan(`Configuration file: ${configManager.getConfigPath()}`));
  console.log(chalk.yellow('\nRestart Claude Desktop for changes to take effect.'));
}