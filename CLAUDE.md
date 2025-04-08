# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Build project: `npm run build`
- Run in dev mode: `npm run dev` (uses watch mode with nodemon)
- Start server: `npm run start`
- Lint code: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Format code: `npm run format`
- Run tests: `npm run test`
- Watch tests: `npm run test:watch`

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
- Formatting: Code is automatically formatted with Prettier
- Linting: ESLint is used with TypeScript rules
- Pre-commit hooks: Husky and lint-staged run linting and formatting before commits

## MCP Integration
- This is an MCP server. Use the guide at
  https://modelcontextprotocol.io/llms-full.txt for documentation on how to
  use MCP. Always download and read this guide before updating the code.
- It is written against the MCP Typescript SDK. Read from
  https://github.com/modelcontextprotocol/typescript-sdk for documentation on
  how to use the SDK.

## Testing
- Tests are written using Vitest
- Test files are stored in the `tests/` directory
- File extensions should be `.test.ts`
- Run tests with `npm run test` or `npm run test:watch`

## CI/CD
- GitHub Actions are configured for CI
- CI workflow runs linting and tests on push and pull requests
