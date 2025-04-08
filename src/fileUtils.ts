import fs from 'fs/promises';
import path from 'path';
import { Artifact, Config } from './types.js';

// Default config
let config: Config = {
  savePath: './artifacts'
};

// Function to update the save path configuration
export const updateSavePath = async (newPath: string): Promise<void> => {
  // Resolve to absolute path
  const absolutePath = path.resolve(newPath);
  
  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(absolutePath, { recursive: true });
    
    // Update the config
    config.savePath = absolutePath;
    console.error(`Save path updated to: ${absolutePath}`);
  } catch (error) {
    throw new Error(`Failed to set save path: ${error}`);
  }
};

// Function to save an artifact to a file
export const saveArtifactToFile = async (artifact: Artifact): Promise<string> => {
  // Create the artifacts directory if it doesn't exist
  await fs.mkdir(config.savePath, { recursive: true });
  
  // Extract directory structure and filename from the title if available
  let outputPath: string;
  
  if (artifact.title) {
    // Get file extension based on artifact type
    const extension = getExtensionForType(artifact.type, artifact.language);
    
    // Check if title has directory structure (contains '/')
    if (artifact.title.includes('/')) {
      // Extract directory parts and filename
      const parts = artifact.title.split('/');
      const fileName = parts.pop() || `artifact-${artifact.id}`;
      const dirStructure = parts.join('/');
      
      // Create full directory path
      const dirPath = path.join(config.savePath, dirStructure);
      
      // Create nested directories
      await fs.mkdir(dirPath, { recursive: true });
      
      // Set full output path with proper extension (avoid double extension)
      if (fileName.endsWith(`.${extension}`)) {
        outputPath = path.join(dirPath, sanitizeFileName(fileName));
      } else {
        outputPath = path.join(dirPath, sanitizeFileName(`${fileName}.${extension}`));
      }
    } else {
      // No directory structure in title, just use filename
      outputPath = path.join(
        config.savePath, 
        sanitizeFileName(`${artifact.title}.${extension}`)
      );
    }
  } else {
    // Fallback to ID-based naming if no title
    outputPath = path.join(
      config.savePath, 
      sanitizeFileName(`artifact-${artifact.id}.${getExtensionForType(artifact.type, artifact.language)}`)
    );
  }
  
  // Write the artifact content to the file
  await fs.writeFile(outputPath, artifact.content);
  
  return outputPath;
};

// Get appropriate file extension based on artifact type
function getExtensionForType(type: string, language?: string): string {
  switch (type) {
    case 'application/vnd.ant.code':
      return getCodeExtension(language || 'txt');
    case 'text/markdown':
      return 'md';
    case 'text/html':
      return 'html';
    case 'image/svg+xml':
      return 'svg';
    case 'application/vnd.ant.mermaid':
      return 'mmd';
    case 'application/vnd.ant.react':
      return 'jsx';
    default:
      return 'txt';
  }
}

// Get appropriate extension for code
function getCodeExtension(language: string): string {
  const extensions: Record<string, string> = {
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'csharp': 'cs',
    'go': 'go',
    'ruby': 'rb',
    'rust': 'rs',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kt',
    'scala': 'scala',
    'shell': 'sh',
    'bash': 'sh',
    'powershell': 'ps1',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yaml': 'yaml',
    'xml': 'xml',
  };
  
  return extensions[language.toLowerCase()] || 'txt';
}

// Sanitize filename to avoid invalid characters but preserve path separators
function sanitizeFileName(fileName: string): string {
  // Don't replace path separators, but sanitize everything else
  return fileName.replace(/[<>:"\\|?*\x00-\x1F]/g, '_');
}

// List all saved artifacts recursively
export const listSavedArtifacts = async (): Promise<string[]> => {
  const results: string[] = [];

  // Recursive function to list files in directory and subdirectories
  async function listFilesRecursively(currentPath: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively process subdirectories
          await listFilesRecursively(entryPath, entryRelativePath);
        } else {
          // Add file to results with its relative path
          results.push(entryRelativePath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
      console.error(`Error reading directory ${currentPath}: ${error}`);
    }
  }

  try {
    await listFilesRecursively(config.savePath);
    return results;
  } catch (error) {
    // If directory doesn't exist yet, return empty array
    return [];
  }
};

// Get current config
export const getConfig = (): Config => {
  return { ...config };
};