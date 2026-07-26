Sure, here's the proposed content for the file: /illustrator-mcp/illustrator-mcp/src/core/utils/logger.ts

import { createLogger, format, transports, Logger } from 'winston';

const logger: Logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/combined.log' }),
        new transports.File({ filename: 'logs/error.log', level: 'error' })
    ],
});

export default logger;