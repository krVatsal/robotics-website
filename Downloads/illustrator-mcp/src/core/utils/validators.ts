Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/core/utils/validators.ts

import { isString, isNumber } from 'lodash';

export function validatePrompt(prompt: string): boolean {
    return isString(prompt) && prompt.trim().length > 0;
}

export function validateLayerId(layerId: number): boolean {
    return isNumber(layerId) && layerId >= 0;
}

export function validateCommand(command: string): boolean {
    const validCommands = ['create', 'delete', 'modify', 'select'];
    return validCommands.includes(command);
}

export function validateColor(color: string): boolean {
    const hexColorPattern = /^#([0-9A-F]{3}){1,2}$/i;
    return hexColorPattern.test(color);
}