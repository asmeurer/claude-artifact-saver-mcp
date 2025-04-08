# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Build project: `npm run build`
- Run in dev mode: `npm run dev`
- Start server: `npm run start`

## Code Style Guidelines
- TypeScript with strict typing enabled
- ES modules format (import/export statements with `.js` extensions)
- Error handling: Use try/catch blocks with detailed error messages
- Naming: camelCase for variables/functions, PascalCase for interfaces
- Async/await pattern preferred over Promise chains
- Function exports: Use named exports with arrow function syntax
- Error propagation: Throw errors with context rather than silencing
- Configuration: Update paths using absolute paths (via path.resolve)
- Logging: Use console.error for server logs to separate from MCP protocol
- File operations: Use fs/promises API with proper error handling

## MCP Integration
- This is an MCP server. Use the guide at
  https://modelcontextprotocol.io/llms-full.txt for documentation on how to
  use MCP. Always download and read this guide before updating the code.
- It is written against the MCP Typescript SDK. Read from
  https://github.com/modelcontextprotocol/typescript-sdk for documentation on
  how to use the SDK.
