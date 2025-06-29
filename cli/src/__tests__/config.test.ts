import { ConfigManager } from '../utils/config.js';
import { writeJsonSync, removeSync } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let testConfigPath: string;

  beforeEach(() => {
    // Create a test config file
    testConfigPath = join(tmpdir(), 'test-claude-config.json');
    
    // Mock the config path
    configManager = new ConfigManager();
    (configManager as any).configPath = testConfigPath;
  });

  afterEach(() => {
    // Clean up test config file
    try {
      removeSync(testConfigPath);
    } catch {}
  });

  describe('read', () => {
    it('should create empty config if file does not exist', () => {
      const config = configManager.read();
      expect(config).toEqual({ mcpServers: {} });
    });

    it('should read existing config', () => {
      const testConfig = {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['test.js']
          }
        }
      };
      writeJsonSync(testConfigPath, testConfig);

      const config = configManager.read();
      expect(config).toEqual(testConfig);
    });
  });

  describe('addServer', () => {
    it('should add a new server', () => {
      const serverConfig = {
        command: 'npx',
        args: ['test-server']
      };

      configManager.addServer('test-server', serverConfig);
      
      const config = configManager.read();
      expect(config.mcpServers?.['test-server']).toEqual(serverConfig);
    });

    it('should throw error if server already exists', () => {
      const serverConfig = {
        command: 'npx',
        args: ['test-server']
      };

      configManager.addServer('test-server', serverConfig);
      
      expect(() => {
        configManager.addServer('test-server', serverConfig);
      }).toThrow("Server 'test-server' already exists in configuration");
    });
  });

  describe('removeServer', () => {
    it('should remove an existing server', () => {
      const serverConfig = {
        command: 'npx',
        args: ['test-server']
      };

      configManager.addServer('test-server', serverConfig);
      configManager.removeServer('test-server');
      
      const config = configManager.read();
      expect(config.mcpServers?.['test-server']).toBeUndefined();
    });

    it('should throw error if server does not exist', () => {
      expect(() => {
        configManager.removeServer('non-existent');
      }).toThrow("Server 'non-existent' not found in configuration");
    });
  });

  describe('listServers', () => {
    it('should return all configured servers', () => {
      const server1 = { command: 'node', args: ['server1.js'] };
      const server2 = { command: 'npx', args: ['server2'] };

      configManager.addServer('server1', server1);
      configManager.addServer('server2', server2);

      const servers = configManager.listServers();
      expect(servers).toEqual({
        server1: server1,
        server2: server2
      });
    });

    it('should return empty object if no servers', () => {
      const servers = configManager.listServers();
      expect(servers).toEqual({});
    });
  });
});