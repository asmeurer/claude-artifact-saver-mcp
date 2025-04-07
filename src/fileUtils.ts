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
  
  // Generate a filename based on the artifact title or ID
  const fileName = artifact.title 
    ? sanitizeFileName(`${artifact.title}.${getExtensionForType(artifact.type, artifact.language)}`)
    : sanitizeFileName(`artifact-${artifact.id}.${getExtensionForType(artifact.type, artifact.language)}`);
  
  const filePath = path.join(config.savePath, fileName);
  
  // Write the artifact content to the file
  await fs.writeFile(filePath, artifact.content);
  
  return filePath;
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

// Sanitize filename to avoid invalid characters
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}

// List all saved artifacts
export const listSavedArtifacts = async (): Promise<string[]> => {
  try {
    const files = await fs.readdir(config.savePath);
    return files;
  } catch (error) {
    // If directory doesn't exist yet, return empty array
    return [];
  }
};

// Get current config
export const getConfig = (): Config => {
  return { ...config };
};