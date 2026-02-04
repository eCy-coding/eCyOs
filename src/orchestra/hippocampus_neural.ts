
import * as lancedb from '@lancedb/lancedb';
import path from 'path';
import fs from 'fs';
import { Brain } from './brain';

interface Memory {
    id: string;
    text: string;
    vector: number[];
    timestamp: number;
}

interface CodeSnippet {
    id: string;
    vector: number[];
    content: string;
    filePath: string;
    lineStart: number;
    lineEnd: number;
    timestamp: number;
}

/**
 * Neural Hippocampus (LanceDB)
 * ----------------------------
 * A high-performance, embedded vector database replacement for the in-memory array.
 * Stores memories persistently on disk with vector indexing.
 */
export class HippocampusNeural {
    private db: lancedb.Connection | null = null;
    private table: lancedb.Table | null = null;
    private dbPath: string;
    private brain: Brain;
    private ready: boolean = false;

    constructor(brain: Brain) {
        this.brain = brain;
        // Store DB in the user data or project root.
        // For 'Stage' dev mode, we'll put it in project root/data/memories
        this.dbPath = path.join(process.cwd(), 'data', 'lancedb');
        this.initialize();
    }

    private async initialize() {
        try {
            if (!fs.existsSync(this.dbPath)) {
                fs.mkdirSync(this.dbPath, { recursive: true });
            }
            
            this.db = await lancedb.connect(this.dbPath);
            
            // Check if table exists
            const tables = await this.db.tableNames();
            if (tables.includes('memories')) {
                this.table = await this.db.openTable('memories');
            } else {
                // Initialize with dummy data to define schema? 
                // LanceDB schema inference is powerful. 
                // We'll create it on first insertion or empty if supported.
                // LanceDB usually requires data or schema to create table.
                // We'll lazy load or creating with empty schema if possible,
                // otherwise we handle in 'remember'.
            }
            
            this.ready = true;
            // console.log('[HippocampusNeural] Online (LanceDB)');
        } catch (error) {
            console.error('[HippocampusNeural] Failed to initialize:', error);
        }
    }

    public isReady(): boolean {
        return this.ready;
    }

    public async remember(text: string): Promise<void> {
        if (!this.ready || !this.db) throw new Error('Hippocampus not ready');
        
        // 1. Vectorize
        const vector = await this.brain.embed(text);
        
        const memory: Memory = {
            id: Math.random().toString(36).substring(7),
            text,
            vector,
            timestamp: Date.now()
        };

        if (!this.table) {
            this.table = await this.db.createTable('memories', [memory] as any);
        } else {
            // Deduplication: Check if semantic duplicate exists
            const existing = await this.table.vectorSearch(vector)
                .limit(1)
                .toArray();
            
            if (existing.length > 0) {
                 // Check distance or text equality
                 // LanceDB returns _distance field. Lower is closer.
                 // If distance is extremely small, it's a dupe.
                 // Also strict text check.
                 const top = existing[0];
                 if (top.text === text) {
                     // Exact text match, skip
                     return;
                 }
                 // If using cosine distance, < 0.05 is usually very similar. 
                 // But for now, strict text dedupe is safer to avoid suppressing nuance.
                //  if (top._distance < 0.01) return; 
            }

            await this.table.add([memory] as any);
        }
    }

    public async recall(query: string, limit: number = 3): Promise<string[]> {
        if (!this.ready || !this.table) return []; // No memories yet

        // 1. Vectorize Query
        const queryVector = await this.brain.embed(query);
        
        // 2. Search
        const results = await this.table.vectorSearch(queryVector)
            .limit(limit)
            .toArray();
            
        // 3. Extract Text
        return results.map((r: any) => r.text as string);
    }

    // Codebase Awareness (Phase 22)
    private codeTable: lancedb.Table | null = null;

    public async indexFile(filePath: string, content: string): Promise<void> {
        if (!this.ready || !this.db) throw new Error('Hippocampus not ready');
        
        // Ensure Code Table exists
        if (!this.codeTable) {
             const tables = await this.db.tableNames();
             if (tables.includes('codebase')) {
                 this.codeTable = await this.db.openTable('codebase');
             } else {
                 // Initialize with dummy schema if needed, but we'll try dynamic creation
             }
        }

        // Chunking Strategy: Sliding Window
        // We want chunks that are meaningful (e.g., functions, classes). 
        // Simple line-based chunking with overlap for now.
        const lines = content.split('\n');
        const CHUNK_SIZE = 30; // ~30 lines
        const OVERLAP = 5;

        const chunks: CodeSnippet[] = [];

        for (let i = 0; i < lines.length; i += (CHUNK_SIZE - OVERLAP)) {
            const end = Math.min(i + CHUNK_SIZE, lines.length);
            const chunkLines = lines.slice(i, end);
            const chunkText = chunkLines.join('\n');
            
            if (chunkText.trim().length < 20) continue; // Skip empty/tiny chunks

            // Vectorize
            const vector = await this.brain.embed(chunkText);
            
            chunks.push({
                id: Math.random().toString(36).substring(7),
                vector,
                content: chunkText,
                filePath,
                lineStart: i + 1,
                lineEnd: end,
                timestamp: Date.now()
            });
        }

        if (chunks.length === 0) return;

        if (!this.codeTable) {
            this.codeTable = await this.db.createTable('codebase', chunks as any);
        } else {
            // Remove existing entries for this file to avoid duplicates on re-index
            try {
                // LanceDB delete syntax varies, strict implementation depends on version.
                // standard: await this.codeTable.delete(`filePath = '${filePath}'`);
                // If not supported in this version, we just append (older versions).
                await this.codeTable.delete(`filePath = '${filePath}'`); 
            } catch(e) { /* ignore if delete not supported or table empty */ }
            
            await this.codeTable.add(chunks as any);
        }
    }

    public async searchCode(query: string, limit: number = 5): Promise<CodeSnippet[]> {
        if (!this.ready) return [];
        if (!this.codeTable) {
             const tables = await this.db!.tableNames();
             if (tables.includes('codebase')) {
                 this.codeTable = await this.db!.openTable('codebase');
             } else {
                 return [];
             }
        }

        const queryVector = await this.brain.embed(query);
        const results = await this.codeTable.vectorSearch(queryVector)
            .limit(limit)
            .toArray();

        return results.map((r: any) => ({
            id: r.id,
            vector: [], // Don't return heavy vector
            content: r.content,
            filePath: r.filePath,
            lineStart: r.lineStart,
            lineEnd: r.lineEnd,
            timestamp: r.timestamp
        }));
    }





}
