# Contributing to Claude Artifact Saver MCP

Thank you for considering contributing to this project! Here's how you can help:

## Development Setup

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting and tests
   ```bash
   npm run lint
   npm run test
   ```
4. Submit a pull request

## Code Style

This project uses ESLint and Prettier for code formatting. Before committing, make sure your code:

- Passes the linter (`npm run lint`)
- Is properly formatted (`npm run format`)
- Has appropriate tests (`npm run test`)

The pre-commit hooks should handle most of this automatically.

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update any relevant documentation
3. Make sure all tests pass
4. The PR will be merged once it has been reviewed and approved

## MCP Protocol

This project implements the Model Context Protocol (MCP) for integration with Claude. Make sure any changes adhere to the MCP specifications.

## Release Process

1. Update the version number in package.json
2. Create a new GitHub release with release notes
3. The package will automatically be published to npm (when CI/CD is setup)
