//Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/handlers/document.ts

import { IllustratorConnection } from '../core/illustrator/connection';
import { DocumentCommands } from '../types/commands';

export class DocumentHandler {
    private connection: IllustratorConnection;

    constructor(connection: IllustratorConnection) {
        this.connection = connection;
    }

    public async createNewDocument(name: string, width: number, height: number): Promise<void> {
        const command: DocumentCommands.CreateDocument = {
            type: 'create_document',
            payload: {
                name,
                width,
                height
            }
        };
        await this.connection.sendCommand(command);
    }

    public async openDocument(filePath: string): Promise<void> {
        const command: DocumentCommands.OpenDocument = {
            type: 'open_document',
            payload: {
                filePath
            }
        };
        await this.connection.sendCommand(command);
    }

    public async saveDocument(filePath: string): Promise<void> {
        const command: DocumentCommands.SaveDocument = {
            type: 'save_document',
            payload: {
                filePath
            }
        };
        await this.connection.sendCommand(command);
    }

    public async closeDocument(): Promise<void> {
        const command: DocumentCommands.CloseDocument = {
            type: 'close_document'
        };
        await this.connection.sendCommand(command);
    }
}