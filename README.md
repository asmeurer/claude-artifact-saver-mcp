# Claude Artifact Saver MCP

A Model Context Protocol (MCP) server that helps save content artifacts from Claude chats to your local filesystem.

## Features

- Save code snippets, markdown, or other text content from Claude chats
- Preserve directory structure in artifact titles
- Automatically determine appropriate file extensions based on content type
- Configure custom save paths for your artifacts

## Installation

```bash
npm install
```

## Usage

Start the MCP server in development mode:

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm run build
npm run start
```

### Available Tools

The MCP server provides the following tools for use with Claude:

- **save-artifact**: Saves content with appropriate file extensions
- **set-save-path**: Changes where artifacts are saved
- **list-artifacts**: Shows all saved artifacts

## Development

### Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode with auto-reloading
- `npm run start` - Start the server from built files
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with automatic fixes
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

### Pre-commit Hooks

This project uses pre-commit to run quality checks before commits. These include:

- TypeScript type checking
- ESLint for code linting
- Prettier for code formatting
- Various file integrity checks (trailing whitespace, EOL, etc.)

To manually run all pre-commit hooks:

```bash
pre-commit run --all-files
```

A GitHub Action is also configured to run these checks on pull requests.

## License

MIT
