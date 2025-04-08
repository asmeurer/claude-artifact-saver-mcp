# Claude Artifact Saver MCP

A Model Context Protocol (MCP) server that helps save content artifacts from Claude chats to your local filesystem.

## Features

- Save code snippets, markdown, or other text content from Claude chats
- Preserve directory structure in artifact titles
- Automatically determine appropriate file extensions based on content type
- Configure custom save paths for your artifacts

## Installation

1. Clone this repository and install dependencies:

```bash
git clone https://github.com/your-username/claude-artifact-saver-mcp.git
cd claude-artifact-saver-mcp
npm install
```

2. Build the project:

```bash
npm run build
```

## MCP Integration

To use this with the Model Context Protocol:

1. Configure your `claude_desktop_config.json` file by adding:

```json
{
  "servers": [
    {
      "name": "claude-artifact-saver",
      "command": ["node", "/absolute/path/to/claude-artifact-saver-mcp/build/index.js"]
    }
  ]
}
```

Replace `/absolute/path/to/claude-artifact-saver-mcp/build/index.js` with the absolute path to the built index.js file.

2. Restart Claude to apply the changes

## Usage

Once integrated with Claude, you can use the following tools in your conversations:

### Available Tools

The MCP server provides the following tools for use with Claude:

- **save-artifact**: Saves content with appropriate file extensions
- **set-save-path**: Changes where artifacts are saved
- **list-artifacts**: Shows all saved artifacts

## Troubleshooting

If you encounter issues:

1. Make sure you've used an absolute path in the config file
2. Verify Claude is configured to use MCP servers
3. Check that the server is properly built with `npm run build`

## License

MIT
