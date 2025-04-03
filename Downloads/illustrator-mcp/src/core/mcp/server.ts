Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/core/mcp/server.ts

import { createServer, IncomingMessage, request, ServerResponse } from 'http';
import { handleRequest } from './handlers';
import { MCPContext } from './context';

const PORT = process.env.PORT || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const context = new MCPContext(req, res);
    handleRequest(context);
});

server.listen(PORT, () => {
    console.log(`MCP Server is running on port ${PORT}`);
});