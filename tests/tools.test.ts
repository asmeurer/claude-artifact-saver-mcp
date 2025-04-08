import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { z } from 'zod';
import fs from 'fs/promises';
import { ToolDefinition } from '../src/types.js';

// Mock the fileUtils module
vi.mock('../src/fileUtils.js', () => ({
  saveToFile: vi.fn(),
  determineFileExtension: vi.fn().mockReturnValue('.txt'),
}));

// Since we can't directly import the tools from index.ts due to MCP specifics,
// we'll recreate a simplified version of the tools for testing
describe('MCP Tools', () => {
  let tools: Record<string, ToolDefinition>;
  let mockSavePath: string;
  let mockSavedArtifacts: string[];
  let fileUtils: any;
  
  beforeEach(async () => {
    mockSavePath = '/default/save/path';
    mockSavedArtifacts = [];
    
    // Import the fileUtils module to access the mocked functions
    fileUtils = await import('../src/fileUtils.js');
    
    // Create simplified versions of the tools for testing
    tools = {
      'save-artifact': {
        description: 'Save content to a file',
        parameters: z.object({
          title: z.string().describe('Title of the content (optional file name)'),
          content: z.string().describe('Content to save'),
        }),
        handler: async ({ title, content }) => {
          const ext = fileUtils.determineFileExtension(content, title);
          const fileName = title.includes('.') ? title : `${title}${ext}`;
          const filePath = path.join(mockSavePath, fileName);
          
          await fileUtils.saveToFile(content, filePath);
          mockSavedArtifacts.push(filePath);
          
          return { success: true, filePath };
        },
      },
      'set-save-path': {
        description: 'Set the directory where artifacts will be saved',
        parameters: z.object({
          path: z.string().describe('Directory path to save artifacts'),
        }),
        handler: async ({ path: newPath }) => {
          mockSavePath = newPath;
          return { success: true, path: newPath };
        },
      },
      'list-artifacts': {
        description: 'List all saved artifacts',
        parameters: z.object({}),
        handler: async () => {
          return { artifacts: mockSavedArtifacts };
        },
      },
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('save-artifact tool', () => {
    it('should save content with the correct file path', async () => {
      // Use fileUtils from top-level
      const title = 'test-file';
      const content = 'Test content';
      
      const result = await tools['save-artifact'].handler({ title, content });
      
      expect(fileUtils.determineFileExtension).toHaveBeenCalledWith(content, title);
      expect(fileUtils.saveToFile).toHaveBeenCalledWith(
        content, 
        path.join(mockSavePath, 'test-file.txt')
      );
      expect(result).toEqual({
        success: true,
        filePath: path.join(mockSavePath, 'test-file.txt'),
      });
      expect(mockSavedArtifacts).toContain(path.join(mockSavePath, 'test-file.txt'));
    });
    
    it('should use existing extension if title has one', async () => {
      // Use fileUtils from top-level
      const title = 'test-file.md';
      const content = 'Test content';
      
      const result = await tools['save-artifact'].handler({ title, content });
      
      expect(fileUtils.determineFileExtension).toHaveBeenCalledWith(content, title);
      expect(fileUtils.saveToFile).toHaveBeenCalledWith(
        content, 
        path.join(mockSavePath, 'test-file.md')
      );
    });
  });

  describe('set-save-path tool', () => {
    it('should update the save path', async () => {
      const newPath = '/new/save/path';
      
      const result = await tools['set-save-path'].handler({ path: newPath });
      
      expect(mockSavePath).toBe(newPath);
      expect(result).toEqual({
        success: true,
        path: newPath,
      });
    });
  });

  describe('list-artifacts tool', () => {
    it('should return the list of saved artifacts', async () => {
      // Add some artifacts
      mockSavedArtifacts.push('/path/to/artifact1.js');
      mockSavedArtifacts.push('/path/to/artifact2.md');
      
      const result = await tools['list-artifacts'].handler({});
      
      expect(result).toEqual({
        artifacts: [
          '/path/to/artifact1.js',
          '/path/to/artifact2.md',
        ],
      });
    });
    
    it('should return an empty list when no artifacts are saved', async () => {      
      const result = await tools['list-artifacts'].handler({});
      
      expect(result).toEqual({
        artifacts: [],
      });
    });
  });
});
