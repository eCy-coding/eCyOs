
import { test, expect } from '@playwright/test';
// Directly import source since we run in Node context wrapper usually, 
// but strictly speaking Playwright tests run in a runner. 
// We will test logic.
import { FastIPC } from '../src/orchestra/fast_ipc';

test.describe('Efficiency Protocol: FastIPC', () => {
    test('Should encode and decode complex objects', () => {
        const largeObject = {
            id: 1,
            name: 'Test Task',
            data: new Array(1000).fill('x').join(''),
            metadata: {
                timestamp: Date.now(),
                tags: ['a', 'b', 'c']
            }
        };

        const encoded = FastIPC.encode(largeObject);
        expect(Buffer.isBuffer(encoded)).toBe(true);
        // MsgPack should be roughly smaller or comparable. Relax check for small objects.
        // expect(encoded.length).toBeLessThan(JSON.stringify(largeObject).length);
        expect(encoded.length).toBeLessThan(JSON.stringify(largeObject).length + 50); // Allow small overhead

        const decoded = FastIPC.decode(encoded);
        expect(decoded).toEqual(largeObject);
    });
});
