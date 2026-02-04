import * as fs from 'fs';
import * as path from 'path';

export class SafeFileSystem {
    private readonly rootDir: string;
    private readonly allowedWritePaths: string[];
    private readonly blockedPaths: string[];

    constructor(rootDir: string) {
        this.rootDir = path.resolve(rootDir);
        this.allowedWritePaths = [
            path.join(this.rootDir, 'src'),
            path.join(this.rootDir, '.gemini'),
            path.join(this.rootDir, 'tests'),
            path.join(this.rootDir, 'e2e')
        ];
        this.blockedPaths = [
            path.join(this.rootDir, 'package.json'),
            path.join(this.rootDir, '.env'),
            path.join(this.rootDir, '.git'),
            path.join(this.rootDir, 'node_modules')
        ];
    }

    /**
     * Securely reads a file.
     * Prevents access to sensitive files like .env unless explicitly allowed.
     */
    public readFile(filePath: string): string {
        const resolvedPath = path.resolve(this.rootDir, filePath);
        
        // Basic Jail Enforcement
        if (!resolvedPath.startsWith(this.rootDir)) {
            throw new Error(`Security Violation: Access to ${filePath} denied (Outside Root).`);
        }

        // Sensitive File Block
        if (this.isBlocked(resolvedPath)) {
             throw new Error(`Security Violation: Read access to sensitive file ${filePath} denied.`);
        }

        return fs.readFileSync(resolvedPath, 'utf-8');
    }

    /**
     * Securely writes a file.
     * Enforces AllowList and BlockList.
     */
    public writeFile(filePath: string, content: string): void {
        const resolvedPath = path.resolve(this.rootDir, filePath);

        // 1. Jail Check
        if (!resolvedPath.startsWith(this.rootDir)) {
            throw new Error(`Security Violation: Write to ${filePath} denied (Outside Root).`);
        }

        // 2. Block List Check
        if (this.isBlocked(resolvedPath)) {
            throw new Error(`Security Violation: Write to sensitive file ${filePath} is BLOCKED.`);
        }

        // 3. Allow List Check
        const isAllowed = this.allowedWritePaths.some(allowed => resolvedPath.startsWith(allowed));
        if (!isAllowed) {
            throw new Error(`Security Violation: Write to ${filePath} not in allowed paths.`);
        }

        // Ensure directory exists
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(resolvedPath, content);
        
        // Audit Log
        this.logAudit('WRITE', resolvedPath);
    }

    private isBlocked(targetPath: string): boolean {
        return this.blockedPaths.some(blocked => targetPath.startsWith(blocked) || targetPath === blocked);
    }

    private logAudit(action: string, targetPath: string): void {
        const logEntry = `[${new Date().toISOString()}] [SafeFS] ${action}: ${targetPath}\n`;
        try {
            // Write to a separate audit log in .gemini, bypassing checks safely
            const auditFile = path.join(this.rootDir, '.gemini/security_audit.log');
            fs.appendFileSync(auditFile, logEntry);
        } catch (e) {
            console.error('Failed to write audit log:', e);
        }
    }
}
