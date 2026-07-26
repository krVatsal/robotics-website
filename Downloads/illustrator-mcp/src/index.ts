//Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/index.ts

import { startServer } from './core/mcp/server';
import { connectToIllustrator } from './core/illustrator/connection';
import { setupHandlers } from './handlers';
import { initializeLogger } from './core/utils/logger';

async function main() {
    // Initialize logger
    initializeLogger();

    // Start MCP server
    await startServer();

    // Connect to Adobe Illustrator
    await connectToIllustrator();

    // Setup command handlers
    setupHandlers();

    console.log('Illustrator MCP integration is running...');
}

// Run the main function
main().catch(error => {
    console.error('Error starting Illustrator MCP:', error);
});