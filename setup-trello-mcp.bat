@echo off
REM Trello MCP Server Setup Script for Claude Code (Windows)
REM This script automates the installation and configuration process

setlocal enabledelayedexpansion

REM Header
echo ================================================
echo   Trello MCP Server Setup for Claude Code
echo ================================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install Node.js and npm first.
    pause
    exit /b 1
)

REM Check if claude CLI is installed
where claude >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Claude CLI is not installed.
    echo Please install it first: npm install -g @anthropic-ai/claude-cli
    pause
    exit /b 1
)

REM Install the package globally
echo Installing Trello MCP Server globally...
call npm install -g @cyberdeep/trello-mcp-server-optimize
if %errorlevel% neq 0 (
    echo Installation failed. Please check your npm permissions.
    pause
    exit /b 1
)
echo Installation successful!
echo.

echo To use this server, you'll need Trello API credentials.
echo Get them from: https://trello.com/app-key
echo.

REM Get API key
:getApiKey
set /p api_key="Enter your Trello API Key: "
if "!api_key!"=="" (
    echo API Key cannot be empty. Please try again.
    goto getApiKey
)

REM Get Token
:getToken
set /p token="Enter your Trello Token: "
if "!token!"=="" (
    echo Token cannot be empty. Please try again.
    goto getToken
)

REM Configure Claude Code
echo.
echo Configuring Claude Code...

REM Create temporary JSON file
set "temp_json=%TEMP%\trello-mcp-config.json"
(
echo {
echo   "command": "trello-mcp-optimize",
echo   "args": [],
echo   "env": {
echo     "TRELLO_API_KEY": "!api_key!",
echo     "TRELLO_TOKEN": "!token!"
echo   }
echo }
) > "!temp_json!"

REM Add the configuration to Claude Code
claude mcp add-json trello-optimized --scope user < "!temp_json!"
if %errorlevel% neq 0 (
    echo Failed to configure Claude Code.
    echo.
    echo You can manually add the configuration with:
    echo claude mcp add-json trello-optimized --scope user "{"command": "trello-mcp-optimize", "args": [], "env": {"TRELLO_API_KEY": "!api_key!", "TRELLO_TOKEN": "!token!"}}"
    del "!temp_json!" >nul 2>nul
    pause
    exit /b 1
)

REM Clean up
del "!temp_json!" >nul 2>nul

REM Success message
echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo The Trello MCP Server has been installed and configured.
echo You can now use Trello tools in Claude Code!
echo.
echo Available tools include:
echo   - get_boards: List all your Trello boards
echo   - get_board_lists: Get lists from a board
echo   - get_cards_in_list: Get cards from a list
echo   - create_card: Create new cards
echo   - And many more!
echo.
echo To verify the installation, restart Claude Code and check
echo if 'trello-optimized' appears in your MCP servers list.
echo.
pause