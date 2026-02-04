import { test, expect } from '@playwright/test';
import { HardwareBridge } from '../src/orchestra/HardwareBridge';

test.describe('Hardware Bridge (Overseer)', () => {
    let bridge: HardwareBridge;
    let receivedLines: string[] = [];

    test.beforeAll(() => {
        bridge = new HardwareBridge(true); // Enable Mock Mode
        bridge.on('data', (line) => receivedLines.push(line));
    });

    test.afterAll(async () => {
        await bridge.disconnect();
    });

    test('should connect to (mock) serial port', async () => {
        const result = await bridge.connect('/dev/tty.mock');
        expect(result).toBe(true);
    });

    test('should send Status (s) command and parse response', async () => {
        receivedLines = []; // Clear buffer
        await bridge.sendCommand('s');
        
        // Wait for mock response
        await new Promise(r => setTimeout(r, 100));

        // Validation against shell.c output
        expect(receivedLines).toContain("STATUS: SYSTEM NOMINAL");
        const active = receivedLines.some(l => l.includes("Brain:  [ACTIVE]"));
        expect(active).toBe(true);
    });

    test('should handle Help (h) command', async () => {
        receivedLines = [];
        await bridge.sendCommand('h');
        
        await new Promise(r => setTimeout(r, 100));
        
        const help = receivedLines.some(l => l.includes("HELP"));
        expect(help).toBe(true);
    });
});
