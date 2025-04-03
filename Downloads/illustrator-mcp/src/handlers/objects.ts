//Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/handlers/objects.ts

import { IllustratorCommand } from '../types/commands';
import { validateObjectName } from '../utils/validators';
import { sendCommandToIllustrator } from '../core/illustrator/connection';

/**
 * Create a new object in Adobe Illustrator.
 * @param objectName - The name of the object to create.
 * @param properties - The properties of the object to create.
 * @returns A promise that resolves with the result of the command.
 */
export const createObject = async (objectName: string, properties: any): Promise<any> => {
    if (!validateObjectName(objectName)) {
        throw new Error('Invalid object name');
    }

    const command: IllustratorCommand = {
        type: 'create_object',
        params: {
            name: objectName,
            properties: properties,
        },
    };

    return await sendCommandToIllustrator(command);
};

/**
 * Modify an existing object in Adobe Illustrator.
 * @param objectName - The name of the object to modify.
 * @param properties - The properties to modify.
 * @returns A promise that resolves with the result of the command.
 */
export const modifyObject = async (objectName: string, properties: any): Promise<any> => {
    if (!validateObjectName(objectName)) {
        throw new Error('Invalid object name');
    }

    const command: IllustratorCommand = {
        type: 'modify_object',
        params: {
            name: objectName,
            properties: properties,
        },
    };

    return await sendCommandToIllustrator(command);
};

/**
 * Delete an object in Adobe Illustrator.
 * @param objectName - The name of the object to delete.
 * @returns A promise that resolves with the result of the command.
 */
export const deleteObject = async (objectName: string): Promise<any> => {
    if (!validateObjectName(objectName)) {
        throw new Error('Invalid object name');
    }

    const command: IllustratorCommand = {
        type: 'delete_object',
        params: {
            name: objectName,
        },
    };

    return await sendCommandToIllustrator(command);
};