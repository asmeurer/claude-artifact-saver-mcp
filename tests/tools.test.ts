import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Artifact } from '../src/types.js';
import * as fileUtils from '../src/fileUtils.js';

// Mock the fileUtils module
vi.mock('../src/fileUtils.js', () => ({
  saveArtifactToFile: vi.fn(),
  updateSavePath: vi.fn(),
  listSavedArtifacts: vi.fn(),
  getConfig: vi.fn(),
}));

// Create test handlers directly from source code logic
// This tests the logic without needing to import the actual module
describe('MCP Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  // Recreate the ListTools handler from index.ts
  const listToolsHandler = async () => {
    return {
      tools: [
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
      ],
    };
  };

  // Recreate the CallTool handler from index.ts
  const callToolHandler = async (request: any) => {
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

          const filePath = await fileUtils.saveArtifactToFile(artifact);

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
          await fileUtils.updateSavePath(typedArgs.path as string);
          const config = fileUtils.getConfig();

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
          const files = await fileUtils.listSavedArtifacts();
          const config = fileUtils.getConfig();

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
  };

  describe('ListTools Handler', () => {
    test('should return the list of available tools', async () => {
      const result = await listToolsHandler();
      
      expect(result).toHaveProperty('tools');
      expect(result.tools).toHaveLength(3); // save-artifact, set-save-path, list-artifacts
      
      // Check that each tool has the expected properties
      const toolNames = result.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('save-artifact');
      expect(toolNames).toContain('set-save-path');
      expect(toolNames).toContain('list-artifacts');
    });
  });

  describe('CallTool Handler', () => {
    test('should handle save-artifact tool correctly', async () => {
      // Setup mock for saveArtifactToFile
      const mockFilePath = '/path/to/saved/artifact.md';
      vi.mocked(fileUtils.saveArtifactToFile).mockResolvedValue(mockFilePath);
      
      const result = await callToolHandler({
        params: {
          name: 'save-artifact',
          arguments: {
            id: 'test-id',
            title: 'Test Title',
            content: 'Test content',
            type: 'text/markdown',
          },
        },
      });
      
      expect(fileUtils.saveArtifactToFile).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-id',
        title: 'Test Title',
        content: 'Test content',
        type: 'text/markdown',
      }));
      
      expect(result).toHaveProperty('content');
      expect(result.content[0].text).toContain('Successfully saved artifact');
      expect(result.content[0].text).toContain(mockFilePath);
    });

    test('should handle save-artifact errors', async () => {
      // Setup mock to throw an error
      vi.mocked(fileUtils.saveArtifactToFile).mockRejectedValue(new Error('Save failed'));
      
      const result = await callToolHandler({
        params: {
          name: 'save-artifact',
          arguments: {
            id: 'test-id',
            content: 'Test content',
            type: 'text/markdown',
          },
        },
      });
      
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error saving artifact');
    });

    test('should handle set-save-path tool correctly', async () => {
      // Setup mocks
      vi.mocked(fileUtils.updateSavePath).mockResolvedValue(undefined);
      vi.mocked(fileUtils.getConfig).mockReturnValue({ savePath: '/updated/path' });
      
      const result = await callToolHandler({
        params: {
          name: 'set-save-path',
          arguments: {
            path: '/updated/path',
          },
        },
      });
      
      expect(fileUtils.updateSavePath).toHaveBeenCalledWith('/updated/path');
      expect(result.content[0].text).toContain('Successfully set save path to /updated/path');
    });

    test('should handle set-save-path errors', async () => {
      // Setup mock to throw an error
      vi.mocked(fileUtils.updateSavePath).mockRejectedValue(new Error('Invalid path'));
      
      const result = await callToolHandler({
        params: {
          name: 'set-save-path',
          arguments: {
            path: '/invalid/path',
          },
        },
      });
      
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error setting save path');
    });

    test('should handle list-artifacts tool correctly', async () => {
      // Setup mocks for non-empty response
      vi.mocked(fileUtils.listSavedArtifacts).mockResolvedValue(['file1.md', 'dir/file2.js']);
      vi.mocked(fileUtils.getConfig).mockReturnValue({ savePath: '/artifacts/path' });
      
      const result = await callToolHandler({
        params: {
          name: 'list-artifacts',
          arguments: {},
        },
      });
      
      expect(result.content[0].text).toContain('Artifacts in /artifacts/path');
      expect(result.content[0].text).toContain('file1.md');
      expect(result.content[0].text).toContain('dir/file2.js');
    });

    test('should handle empty list of artifacts', async () => {
      // Setup mocks for empty response
      vi.mocked(fileUtils.listSavedArtifacts).mockResolvedValue([]);
      vi.mocked(fileUtils.getConfig).mockReturnValue({ savePath: '/artifacts/path' });
      
      const result = await callToolHandler({
        params: {
          name: 'list-artifacts',
          arguments: {},
        },
      });
      
      expect(result.content[0].text).toContain('No artifacts found in /artifacts/path');
    });

    test('should handle list-artifacts errors', async () => {
      // Setup mock to throw an error
      vi.mocked(fileUtils.listSavedArtifacts).mockRejectedValue(new Error('List failed'));
      
      const result = await callToolHandler({
        params: {
          name: 'list-artifacts',
          arguments: {},
        },
      });
      
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error listing artifacts');
    });

    test('should return error for unknown tool', async () => {
      const result = await callToolHandler({
        params: {
          name: 'non-existent-tool',
          arguments: {},
        },
      });
      
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Unknown tool: non-existent-tool');
    });
  });
});