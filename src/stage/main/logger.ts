
import log from 'electron-log/main';
import { join } from 'path';

/**
 * Universal Logger (The Optic Nerve)
 * ----------------------------------
 * Handles structured logging for Main and Utility processes.
 * Writes to: ~/Library/Logs/sistem/
 */

// Initialize functionality
log.initialize();

// Configure format
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{level}] {text}';

// Handle Uncaught Errors globally
log.errorHandler.startCatching();

export class Logger {
    private scope: string;

    constructor(scope: string = 'main') {
        this.scope = scope;
        // Optional: Separate files per scope if needed, 
        // but single file is usually better for correlation.
    }

    public info(message: string, ...args: unknown[]): void {
        log.info(`[${this.scope}] ${message}`, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        log.warn(`[${this.scope}] ${message}`, ...args);
    }

    public error(message: string, ...args: unknown[]): void {
        log.error(`[${this.scope}] ${message}`, ...args);
    }

    public static getPath(): string {
        return log.transports.file.getFile().path;
    }
}
