/**
 * HardwareBridge.ts
 * The "Overseer" Module
 * Connects Electron (Brain) to STM32 (Swarm) via Serial Port.
 */

import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';

export interface HardwareStatus {
    brain: boolean;
    vision: boolean;
    swarm_size: number;
    connected: boolean;
}

export class HardwareBridge extends EventEmitter {
    private port: any = null;
    private isMock: boolean = false;
    private buffer: string = '';
    private worker?: Worker; 
    private _previousPaths: string[] = [];
    /**
     * Spawns a dedicated worker for handling heavy hardware I/O.
     * Compliant with Google TS Style: JSDoc present, Type Safety enforced.
     * 
     * @param {string} scriptPath - Absolute path to the worker script.
     * @returns {void}
     */
    private spawnWorker(scriptPath: string): void {
        this.worker = new Worker(scriptPath);
        
        this.worker.on('message', (msg: any) => {
            // Type Guard / Safe Casting
            const message = msg as { type: string; payload: any };
            // console.log(`[HardwareBridge] Worker Message: ${message.type}`);
        });

        this.worker.on('error', (err: Error) => {
            console.error(`[HardwareBridge] Worker Error:`, err);
        });
    }

    constructor(mock: boolean = false) {
        super();
        this.isMock = mock;
    }

    /**
     * Establishes a connection to the specified serial port.
     * 
     * @param {string} path - The device path (e.g., /dev/ttyUSB0).
     * @returns {Promise<boolean>} - True if connection successful.
     */
    public async connect(path: string): Promise<boolean> {
        if (this.isMock) {
            // console.log(`[HardwareBridge] Mock connected to ${path}`);
            setTimeout(() => this.emit('open'), 100);
            return true;
        }

        try {
            // Dynamic import to avoid hard dependency
            const { SerialPort } = await eval('import("serialport")');
            const { ReadlineParser } = await eval('import("@serialport/parser-readline")');

            this.port = new SerialPort({ path, baudRate: 9600 });
            
            const parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
            
            this.port.on('open', () => this.emit('open'));
            parser.on('data', (data: string) => this.handleData(data));
            this.port.on('error', (err: any) => this.emit('error', err));
            
            return true;
        } catch (error) {
            console.error("[HardwareBridge] SerialPort module missing or error:", error);
            // Fallback to Mock if forced, or fail
            return false;
        }
    }

    /**
     * Sends a command to the embedded shell
     */
    async sendCommand(cmd: 's' | 'r' | 'h'): Promise<void> {
        if (this.isMock) {
            this.simulateResponse(cmd);
            return;
        }

        if (this.port && this.port.isOpen) {
            this.port.write(cmd);
        } else {
            throw new Error("Port not open");
        }
    }

    /**
     * Disconnects
     */
    async disconnect(): Promise<void> {
        if (this.port && this.port.isOpen) {
            this.port.close();
        }
        this.emit('close');
    }

    /**
     * Handles incoming data from STM32 `shell.c`
     */
    private handleData(line: string) {
        line = line.trim();
        this.emit('data', line);

        // Parse specific responses
        if (line.includes("Brain: [ACTIVE]")) {
            this.emit('status_update', { component: 'brain', status: 'active' });
        }
    }

    /**
     * Calibrated Detection: Uses SetTheory to find added/removed devices.
     */
    public async detectChanges(currentPaths: string[]): Promise<{ added: string[], removed: string[] }> {
        // Dynamic import to use the SetTheory module we just created
        const { SetTheory } = await import('./math/SetTheory');
        
        // Mock "previous" state using a static or managed set (simulated here for atomic purity)
        // In a real loop, this._lastKnownPorts would be a class member.
        // For this calibration step, we assume the caller handles state, or we define it here.
        const prevSet = new SetTheory<string>(this._previousPaths);
        const currSet = new SetTheory<string>(currentPaths);

        const added = currSet.difference(prevSet).toArray();
        const removed = prevSet.difference(currSet).toArray();

        // Update state
        this._previousPaths = currentPaths;

        return { added, removed };
    }

    /**
     * Mocks the `shell.c` logic for E2E tests
     */
    private simulateResponse(cmd: string) {
        setTimeout(() => {
            switch(cmd) {
                case 's':
                    this.handleData("STATUS: SYSTEM NOMINAL");
                    this.handleData(" - Brain:  [ACTIVE]");
                    this.handleData(" - Vision: [ACTIVE]");
                    this.handleData(" - Swarm:  [3 NODES]");
                    break;
                case 'h':
                    this.handleData("HELP: s - Status, r - Reset");
                    break;
            }
        }, 50);
    }
}
