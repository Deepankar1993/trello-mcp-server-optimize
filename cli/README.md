# Claude MCP CLI

A command-line tool for managing MCP (Model Context Protocol) servers in Claude Desktop.

## Features

- 🚀 **Easy Installation**: Add MCP servers from NPM packages or local configurations
- 📝 **JSON Configuration**: Support for custom JSON-based server configurations
- 🔧 **Platform Support**: Works on macOS, Windows, and Linux
- 🎯 **Interactive Mode**: Guided setup with prompts
- ✅ **Validation**: Verify server configurations before use
- 📦 **NPM Integration**: Automatically install and configure NPM-based MCP servers

## Installation

```bash
npm install -g claude-mcp-cli
```

Or use without installation:

```bash
npx claude-mcp-cli
```

## Quick Start

### Add an MCP server from NPM

```bash
# Add the Trello MCP server
claude-mcp add trello-mcp-server

# Add with custom name
claude-mcp add trello-mcp-server --name my-trello
```

### Add from JSON configuration

```bash
# Add from a JSON file
claude-mcp add-json ./my-server-config.json

# Or using the add command
claude-mcp add ./my-server-config.json
```

### List configured servers

```bash
claude-mcp list
```

### Remove a server

```bash
claude-mcp remove trello-mcp-server
```

## Commands

### `add [package]`

Add an MCP server to Claude Desktop.

**Options:**
- `-n, --name <name>` - Custom name for the server
- `-y, --yes` - Skip confirmation prompts
- `--no-install` - Skip NPM installation (for local packages)

**Examples:**

```bash
# Add from NPM
claude-mcp add trello-mcp-server

# Add from JSON
claude-mcp add ./config.json

# Interactive mode
claude-mcp add
```

### `add-json <jsonFile>`

Add an MCP server from a JSON configuration file.

**Options:**
- `-n, --name <name>` - Custom name for the server
- `-y, --yes` - Skip confirmation prompts

**Example:**

```bash
claude-mcp add-json ./examples/trello-mcp-config.json
```

### `list`

List all configured MCP servers.

**Options:**
- `-j, --json` - Output as JSON

**Example:**

```bash
claude-mcp list
```

### `remove [name]`

Remove an MCP server from Claude Desktop.

**Options:**
- `-y, --yes` - Skip confirmation prompt

**Examples:**

```bash
# Remove specific server
claude-mcp remove trello-mcp-server

# Interactive selection
claude-mcp remove
```

### `validate [name]`

Validate MCP server configurations.

**Examples:**

```bash
# Validate all servers
claude-mcp validate

# Validate specific server
claude-mcp validate trello-mcp-server
```

## JSON Configuration Format

Create a JSON file with the following structure:

```json
{
  "name": "my-mcp-server",
  "command": "node",
  "args": ["/path/to/server.js"],
  "env": {
    "API_KEY": "your-api-key",
    "DEBUG": "true"
  }
}
```

**Fields:**
- `name` (optional): Server name (can be overridden with --name flag)
- `command` (required): Command to execute
- `args` (optional): Array of command arguments
- `env` (optional): Environment variables

## Examples

### Trello MCP Server

```json
{
  "name": "trello-mcp-server",
  "command": "npx",
  "args": ["trello-mcp-server"],
  "env": {
    "TRELLO_API_KEY": "your_key_here",
    "TRELLO_TOKEN": "your_token_here"
  }
}
```

### Local Development Server

```json
{
  "name": "dev-server",
  "command": "node",
  "args": ["./dist/index.js"],
  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug"
  }
}
```

## Configuration File Location

The CLI manages the Claude Desktop configuration file located at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## NPM Package MCP Configuration

NPM packages can include MCP configuration in their `package.json`:

```json
{
  "name": "my-mcp-server",
  "mcp": {
    "command": "node",
    "args": ["./server.js"],
    "env": {
      "DEFAULT_PORT": "3000"
    }
  }
}
```

## Troubleshooting

### Server not appearing in Claude Desktop

After adding a server, you need to restart Claude Desktop for the changes to take effect.

### Command not found errors

Make sure the command specified in your configuration is available in your system's PATH.

### Permission errors

On some systems, you may need to run the CLI with appropriate permissions to modify the Claude Desktop configuration file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT