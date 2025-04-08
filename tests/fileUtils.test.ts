import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
// Set up the mocks before importing the module to be tested
vi.doMock('fs/promises', () => ({
  default: {},
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
  readdir: vi.fn(),
}));

// Import the functions we're testing after mocking
import * as fileUtils from '../src/fileUtils.js';

// Mock console.error
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('fileUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('determineFileExtension', () => {
    it('should return .js for JavaScript code', () => {
      const content = 'function test() { return true; }';
      const title = 'test';
      expect(fileUtils.determineFileExtension(content, title)).toBe('.js');
    });

    it('should return .md for markdown content', () => {
      const content = '# Heading\n\nThis is markdown';
      const title = 'test';
      expect(fileUtils.determineFileExtension(content, title)).toBe('.md');
    });

    it('should use extension from title if available', () => {
      const content = 'const test = true;';
      const title = 'test.ts';
      expect(fileUtils.determineFileExtension(content, title)).toBe('.ts');
    });

    it('should return .txt for unknown content types', () => {
      const content = 'Plain text without clear indicators';
      const title = 'test';
      expect(fileUtils.determineFileExtension(content, title)).toBe('.txt');
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', async () => {
      // Mock fs.access to throw, simulating directory not found
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('not found'));
      
      await fileUtils.ensureDirectoryExists('/path/to/dir');
      
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });

    it('should not create directory if it already exists', async () => {
      // Mock fs.access to resolve, simulating directory exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      
      await fileUtils.ensureDirectoryExists('/path/to/dir');
      
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('unexpected error');
      vi.mocked(fs.access).mockRejectedValueOnce(error);
      
      await fileUtils.ensureDirectoryExists('/path/to/dir');
      
      expect(console.error).toHaveBeenCalledWith('Error checking directory:', error);
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });
  });

  describe('saveToFile', () => {
    it('should save content to the specified path', async () => {
      // Mock ensureDirectoryExists to do nothing
      vi.mock('../src/fileUtils.js', async (importOriginal) => {
        const original = await importOriginal();
        return {
          ...original,
          ensureDirectoryExists: vi.fn(),
        };
      }, { virtual: true });

      const content = 'Test content';
      const filePath = '/path/to/file.txt';
      
      await fileUtils.saveToFile(content, filePath);
      
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, content);
    });

    it('should handle write errors', async () => {
      const error = new Error('write error');
      vi.mocked(fs.writeFile).mockRejectedValueOnce(error);
      
      const content = 'Test content';
      const filePath = '/path/to/file.txt';
      
      await fileUtils.saveToFile(content, filePath);
      
      expect(console.error).toHaveBeenCalledWith('Error saving file:', error);
    });
  });
});
