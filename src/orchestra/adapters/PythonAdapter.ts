/**
 * PythonAdapter.ts
 * 
 * Bridges the gap between Node.js/Electron and the Python Cortex.
 * Implements a robust persistent process manager with JSON-RPC style ID matching
 * and line-based buffering to prevent race conditions and partial reads.
 */

import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface PythonResponse {
    id?: string;
    status: 'ok' | 'error';
    result?: unknown;
    error?: string;
}

interface PendingRequest {
    resolve: (response: PythonResponse) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
}

export class PythonAdapter {
    private process: ChildProcess | null = null;
    private scriptPath: string;
    private pendingRequests = new Map<string, PendingRequest>();
    private buffer = '';

    constructor() {
        // Assume src/python/main.py is located relative to execution path
        this.scriptPath = join(process.cwd(), 'src/python/main.py');
    }

    public start(): void {
        if (this.process) return;

        this.process = spawn('python3', [this.scriptPath]);

        this.process.stderr?.on('data', (data) => {
            const msg = data.toString().trim();
            // Log purely informational/debug messages from Python
            if (msg) console.error(`[Python Cortex Log]: ${msg}`);
        });

        this.process.stdout?.on('data', (data) => this.handleData(data));

        this.process.on('close', (code) => {
            console.warn(`[Python Cortex] Exited with code ${code}`);
            this.process = null;
            this.cleanupPendingRequests(new Error(`Python process exited unexpectedly with code ${code}`));
        });

        this.process.on('error', (err) => {
            console.error('[Python Cortex] Process error:', err);
            this.cleanupPendingRequests(err);
        });
    }

    private handleData(data: Buffer): void {
        this.buffer += data.toString();
        
        // Split by newline
        const lines = this.buffer.split('\n');
        
        // The last element is either confirmed empty (if buffer ended with \n) 
        // or it is a partial line that needs to stay in the buffer.
        this.buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            try {
                const response = JSON.parse(trimmed) as PythonResponse;
                
                // Route response to correct request
                if (response.id && this.pendingRequests.has(response.id)) {
                    const req = this.pendingRequests.get(response.id)!;
                    clearTimeout(req.timer);
                    this.pendingRequests.delete(response.id);
                    req.resolve(response);
                } else if (!response.id) {
                    // Fallback for un-id'ed messages or critical errors, though main.py should send IDs
                    console.warn('[Python Cortex] Received response without ID:', trimmed);
                }
            } catch (e) {
                console.error('[Python Cortex] Failed to parse JSON line:', trimmed, e);
            }
        }
    }

    private cleanupPendingRequests(error: Error): void {
        for (const [id, req] of this.pendingRequests) {
            clearTimeout(req.timer);
            req.reject(error);
        }
        this.pendingRequests.clear();
        this.buffer = '';
    }

    public async execute(action: string, payload: unknown = {}): Promise<PythonResponse> {
        if (!this.process) {
            this.start();
        }

        return new Promise((resolve, reject) => {
            const id = randomUUID();
            const cmd = JSON.stringify({ id, action, payload }) + '\n';

            // Safety timeout
            const timer = setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error(`Python Cortex Timeout (${action})`));
                }
            }, 30000); // 30s timeout

            this.pendingRequests.set(id, { resolve, reject, timer });

            try {
                const written = this.process?.stdin?.write(cmd);
                if (!written) {
                    // Buffer full? In node, write usually returns false but handles later.
                    // But if process is dead, 'error' event should trigger.
                }
            } catch (e) {
                clearTimeout(timer);
                this.pendingRequests.delete(id);
                reject(e instanceof Error ? e : new Error(String(e)));
            }
        });
    }

    public stop(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.cleanupPendingRequests(new Error('Python Cortex stopped manually'));
        }
    }
}
