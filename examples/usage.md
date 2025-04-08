# Claude Artifact Saver MCP Usage Examples

This document provides examples of how to use the Claude Artifact Saver MCP tools in your Claude chats.

## Setting Up

1. Start the MCP server:
   ```bash
   npm run dev
   ```

2. The server will output a URL that you can use to connect Claude to the MCP server.

## Example Usage

### Save a Code Snippet

```
Claude, please save this code snippet:

function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

console.log(calculateFibonacci(10));
```

#### Claude's Response

I've saved your code snippet. You can use these MCP tools:

- `save-artifact`: To save this code to a file named "fibonacci.js"
- `set-save-path`: To change where files are saved
- `list-artifacts`: To see all saved files

Would you like me to save this code now?

### Setting a Custom Save Path

```
Claude, please set the save path to "~/Documents/code-snippets"
```

#### Claude's Response

I've set the save path to "~/Documents/code-snippets". All future artifacts will be saved to this location.

### Listing Saved Artifacts

```
Claude, please list all the artifacts you've saved so far
```

#### Claude's Response

Here are all the artifacts I've saved:

1. ~/Documents/code-snippets/fibonacci.js
2. ~/Documents/code-snippets/styles.css
3. ~/Documents/code-snippets/config.json

## Advanced Uses

### Preserving Directory Structure

You can include paths in the artifact title to maintain directory structure:

```
Claude, save this README in src/components/Button/README.md
```

The artifact will be saved at `<save-path>/src/components/Button/README.md`, preserving the directory structure.

### Automatic File Type Detection

The tool automatically determines the best file extension based on content:

- JavaScript/TypeScript code → .js/.ts
- HTML → .html
- CSS → .css
- Markdown → .md
- JSON → .json
- Plain text (default) → .txt