import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  saveArtifactToFile,
  updateSavePath,
  listSavedArtifacts,
  getConfig,
} from '../src/fileUtils.js';
import fs from 'fs/promises';
// path is used in mocks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import path from 'path';
import { Artifact } from '../src/types.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn(),
  },
}));

// Mock path
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((path) => `/absolute/${path}`),
  },
}));

describe('fileUtils', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateSavePath', () => {
    test('should update the save path and create directory if needed', async () => {
      const newPath = 'test-artifacts';
      await updateSavePath(newPath);

      // Check if it tries to create the directory
      expect(fs.mkdir).toHaveBeenCalledWith('/absolute/test-artifacts', { recursive: true });

      // Check if config is updated
      const config = getConfig();
      expect(config.savePath).toBe('/absolute/test-artifacts');
    });

    test('should throw error if mkdir fails', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Permission denied'));

      await expect(updateSavePath('test-path')).rejects.toThrow('Failed to set save path');
    });
  });

  describe('saveArtifactToFile', () => {
    test('should save an artifact with title to a file', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        title: 'test-title',
        content: 'test content',
        type: 'text/markdown',
        createdAt: new Date(),
      };

      const filePath = await saveArtifactToFile(artifact);

      expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), 'test content');
      expect(filePath).toContain('test-title.md');
    });

    test('should handle artifacts with nested directory structure in title', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        title: 'dir1/dir2/test-file',
        content: 'test content',
        type: 'application/vnd.ant.code',
        language: 'javascript',
        createdAt: new Date(),
      };

      const filePath = await saveArtifactToFile(artifact);

      // Should create the nested directory
      expect(fs.mkdir).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('dir1/dir2/test-file.js'),
        'test content',
      );
      expect(filePath).toContain('dir1/dir2/test-file.js');
    });

    test('should generate a filename if title is not provided', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        content: 'test content',
        type: 'text/html',
        createdAt: new Date(),
      };

      const filePath = await saveArtifactToFile(artifact);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('artifact-test-id.html'),
        'test content',
      );
      expect(filePath).toContain('artifact-test-id.html');
    });

    test('should handle different artifact types and languages', async () => {
      const testCases = [
        { type: 'application/vnd.ant.code', language: 'python', expectedExt: 'py' },
        { type: 'text/markdown', language: undefined, expectedExt: 'md' },
        { type: 'application/vnd.ant.mermaid', language: undefined, expectedExt: 'mmd' },
        { type: 'unknown/type', language: undefined, expectedExt: 'txt' },
      ];

      for (const { type, language, expectedExt } of testCases) {
        vi.clearAllMocks();

        const artifact: Artifact = {
          id: 'test-id',
          title: `test-file-${type}`,
          content: 'test content',
          type,
          language,
          createdAt: new Date(),
        };

        const filePath = await saveArtifactToFile(artifact);
        expect(filePath).toContain(`.${expectedExt}`);
      }
    });

    test('should sanitize filenames', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        title: 'test:file?with*invalid<chars>',
        content: 'test content',
        type: 'text/plain',
        createdAt: new Date(),
      };

      const filePath = await saveArtifactToFile(artifact);

      expect(filePath).toContain('test_file_with_invalid_chars_.txt');
      expect(filePath).not.toContain('?');
      expect(filePath).not.toContain('*');
      expect(filePath).not.toContain('<');
      expect(filePath).not.toContain('>');
    });
  });

  describe('listSavedArtifacts', () => {
    test('should list all artifacts recursively', async () => {
      // Mock readdir to simulate a directory with files and subdirectories
      vi.mocked(fs.readdir).mockImplementation((path) => {
        if (path === getConfig().savePath) {
          return Promise.resolve([
            { name: 'file1.txt', isDirectory: (): boolean => false },
            { name: 'dir1', isDirectory: (): boolean => true },
          ] as unknown[]);
        } else if (path.toString().includes('dir1')) {
          return Promise.resolve([
            { name: 'file2.txt', isDirectory: (): boolean => false },
            { name: 'file3.md', isDirectory: (): boolean => false },
          ] as unknown[]);
        }
        return Promise.resolve([]);
      });

      const files = await listSavedArtifacts();

      expect(files).toEqual(['/file1.txt', '/dir1/file2.txt', '/dir1/file3.md']);
    });

    test('should return empty array if directory does not exist', async () => {
      vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('ENOENT: Directory not found'));

      const files = await listSavedArtifacts();

      expect(files).toEqual([]);
    });

    test('should skip directories with read errors', async () => {
      vi.mocked(fs.readdir).mockImplementation((path) => {
        if (path === getConfig().savePath) {
          return Promise.resolve([
            { name: 'file1.txt', isDirectory: (): boolean => false },
            { name: 'dir1', isDirectory: (): boolean => true },
            { name: 'dir2', isDirectory: (): boolean => true },
          ] as unknown[]);
        } else if (path.toString().includes('dir1')) {
          return Promise.reject(new Error('Permission denied'));
        } else if (path.toString().includes('dir2')) {
          return Promise.resolve([
            { name: 'file2.txt', isDirectory: (): boolean => false },
          ] as unknown[]);
        }
        return Promise.resolve([]);
      });

      const files = await listSavedArtifacts();

      // Should include files from root and dir2, but not dir1
      expect(files).toContain('/file1.txt');
      expect(files).toContain('/dir2/file2.txt');
      expect(files).toHaveLength(2);
    });
  });

  describe('getConfig', () => {
    test('should return a copy of the config', () => {
      const config1 = getConfig();
      const config2 = getConfig();

      // Should be a deep copy, not the same object
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);

      // Modifying one should not affect the other
      config1.savePath = 'new-path';
      expect(config2.savePath).not.toBe('new-path');
    });
  });
});
