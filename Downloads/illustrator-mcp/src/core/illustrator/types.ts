//Sure, here's the proposed content for the file `/illustrator-mcp/illustrator-mcp/src/core/illustrator/types.ts`:

export interface IllustratorCommand {
    type: string;
    payload: any;
}

export interface IllustratorResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface DocumentInfo {
    name: string;
    width: number;
    height: number;
    layers: LayerInfo[];
}

export interface LayerInfo {
    name: string;
    visible: boolean;
    objects: ObjectInfo[];
}

export interface ObjectInfo {
    type: string;
    properties: Record<string, any>;
}