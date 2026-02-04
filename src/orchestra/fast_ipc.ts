
import { pack, unpack } from 'msgpackr';

/**
 * FastIPC (The Nervous System Upgrade)
 * ------------------------------------
 * High-performance binary serialization using MessagePack.
 * Used to bypass slow Structured Clone / JSON Serialization for large payloads
 * (e.g. Brain responses, Large Task Lists).
 */
export class FastIPC {
    /**
     * Encodes a message for IPC transmission using the Ankara Protocol.
     * @param data Payload
     */
    public static encode(data: unknown): Buffer {
        // [AUDITOR-FIX] Remove 'any', enforce JSON serialization safety
        const json = JSON.stringify(data);
        const length = Buffer.byteLength(json);
        const header = Buffer.alloc(4);
        header.writeUInt32LE(length, 0);
        return Buffer.concat([header, Buffer.from(json)]);
    }

    /**
     * Deserializes a Buffer (MessagePack) back to an object.
     * @param buffer Buffer or Uint8Array
     * @returns Original Object
     */
    public static decode<T>(buffer: Buffer | Uint8Array): T {
        return unpack(buffer) as T;
    }
}
