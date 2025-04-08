import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { saveArtifactToFile, updateSavePath, listSavedArtifacts, getConfig } from './fileUtils.js';
import { Artifact } from './types.js';

// Create an MCP server
const server = new Server(
  {
    name: 'artifact-saver',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Define the tools
const tools = [
  {
    name: 'save-artifact',
    description: 'Save a Claude chat artifact to a file',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Artifact ID',
        },
        title: {
          type: 'string',
          description: 'Title for the artifact (optional)',
        },
        content: {
          type: 'string',
          description: 'Content of the artifact',
        },
        type: {
          type: 'string',
          description: 'Type of the artifact (e.g., application/vnd.ant.code, text/markdown)',
        },
        language: {
          type: 'string',
          description: 'Language for code artifacts (optional)',
        },
      },
      required: ['id', 'content', 'type'],
    },
  },
  {
    name: 'set-save-path',
    description: 'Set the directory path where artifacts will be saved',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path to save artifacts',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'list-artifacts',
    description: 'List all saved artifacts',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Handle tool listing requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'save-artifact': {
      try {
        const typedArgs = args as Record<string, unknown>;
        const artifact: Artifact = {
          id: typedArgs.id as string,
          title: typedArgs.title as string | undefined,
          content: typedArgs.content as string,
          type: typedArgs.type as string,
          language: typedArgs.language as string | undefined,
          createdAt: new Date(),
        };

        const filePath = await saveArtifactToFile(artifact);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully saved artifact "${artifact.title || artifact.id}" to ${filePath}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error saving artifact: ${error}`,
            },
          ],
        };
      }
    }

    case 'set-save-path': {
      try {
        const typedArgs = args as Record<string, unknown>;
        await updateSavePath(typedArgs.path as string);
        const config = getConfig();

        return {
          content: [
            {
              type: 'text',
              text: `Successfully set save path to ${config.savePath}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error setting save path: ${error}`,
            },
          ],
        };
      }
    }

    case 'list-artifacts': {
      try {
        const files = await listSavedArtifacts();
        const config = getConfig();

        if (files.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No artifacts found in ${config.savePath}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Artifacts in ${config.savePath}:\n${files.join('\n')}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error listing artifacts: ${error}`,
            },
          ],
        };
      }
    }

    default:
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
      };
  }
});

// Start the server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Artifact Saver MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
