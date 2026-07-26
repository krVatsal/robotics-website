//Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/types/config.ts

export interface MCPConfig {
    apiKey: string;
    serverUrl: string;
    timeout: number;
    retryAttempts: number;
}

export const defaultConfig: MCPConfig = {
    apiKey: '',
    serverUrl: 'http://localhost:3000',
    timeout: 5000,
    retryAttempts: 3,
};