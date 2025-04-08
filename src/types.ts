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

// MCP Tool Definition
export interface ToolDefinition {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: any) => Promise<any>;
}
