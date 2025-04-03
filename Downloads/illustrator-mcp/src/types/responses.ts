//Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/types/responses.ts

export interface MCPResponse {
    status: string;
    message?: string;
    data?: any;
}

export interface CommandResponse extends MCPResponse {
    commandId: string;
    result?: any;
}

export interface ErrorResponse extends MCPResponse {
    errorCode: number;
}

export interface DocumentResponse extends MCPResponse {
    documentId: string;
    documentName: string;
}

export interface LayerResponse extends MCPResponse {
    layerId: string;
    layerName: string;
    visibility: boolean;
}

export interface ObjectResponse extends MCPResponse {
    objectId: string;
    objectType: string;
    properties: Record<string, any>;
}