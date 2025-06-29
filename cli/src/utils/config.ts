import { homedir, platform } from 'os';
import { join } from 'path';
import { readJsonSync, writeJsonSync, ensureFileSync } from 'fs-extra';
import chalk from 'chalk';

export interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ClaudeConfig {
  mcpServers?: Record<string, MCPServerConfig>;
}

export class ConfigManager {
  private configPath: string;

  constructor() {
    // Determine Claude Desktop config location based on platform
    const home = homedir();
    switch (platform()) {
      case 'darwin': // macOS
        this.configPath = join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        break;
      case 'win32': // Windows
        this.configPath = join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
        break;
      default: // Linux and others
        this.configPath = join(home, '.config', 'claude', 'claude_desktop_config.json');
    }
  }

  /**
   * Read the Claude Desktop configuration
   */
  read(): ClaudeConfig {
    try {
      ensureFileSync(this.configPath);
      const config = readJsonSync(this.configPath, { throws: false }) || {};
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      return config;
    } catch (error) {
      console.error(chalk.yellow('Warning: Could not read Claude Desktop config'));
      return { mcpServers: {} };
    }
  }

  /**
   * Write the Claude Desktop configuration
   */
  write(config: ClaudeConfig): void {
    try {
      ensureFileSync(this.configPath);
      writeJsonSync(this.configPath, config, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to write Claude Desktop config: ${error}`);
    }
  }

  /**
   * Add an MCP server to the configuration
   */
  addServer(name: string, serverConfig: MCPServerConfig): void {
    const config = this.read();
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    if (config.mcpServers[name]) {
      throw new Error(`Server '${name}' already exists in configuration`);
    }

    config.mcpServers[name] = serverConfig;
    this.write(config);
  }

  /**
   * Remove an MCP server from the configuration
   */
  removeServer(name: string): void {
    const config = this.read();
    if (!config.mcpServers || !config.mcpServers[name]) {
      throw new Error(`Server '${name}' not found in configuration`);
    }

    delete config.mcpServers[name];
    this.write(config);
  }

  /**
   * Get a specific server configuration
   */
  getServer(name: string): MCPServerConfig | undefined {
    const config = this.read();
    return config.mcpServers?.[name];
  }

  /**
   * List all MCP servers
   */
  listServers(): Record<string, MCPServerConfig> {
    const config = this.read();
    return config.mcpServers || {};
  }

  /**
   * Get the configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}