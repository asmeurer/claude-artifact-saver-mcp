// Define types for artifacts
export interface Artifact {
  id: string;
  title?: string;
  content: string;
  type: string;
  language?: string;
  createdAt: Date;
}

// Define the configuration
export interface Config {
  savePath: string;
}