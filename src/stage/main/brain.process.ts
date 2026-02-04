// Brain Process: Worker Thread Edition
// Now running lightweight via 'worker_threads'
import { parentPort } from 'worker_threads';

import { Brain } from '../../orchestra/brain';
import { FastIPC } from '../../orchestra/fast_ipc';
import { Logger } from './logger';

/**
 * Brain Process (The Subconscious)
 * --------------------------------
 * This code runs in a separate NODE.JS WORKER THREAD.
 * It handles all AI operations without blocking the Main Thread or UI.
 */

import { HippocampusNeural } from '../../orchestra/hippocampus_neural';

// console.log('[BrainProcess] WARP CORE ONLINE: Worker Thread Initialized.');
const logger = new Logger('brain-process');

try {
    process.on('uncaughtException', (err) => {
        console.error('[BrainProcess] Critical Failure:', err);
    });
    process.on('unhandledRejection', (reason) => {
        console.error('[BrainProcess] Unhandled Rejection:', reason);
    });

    let brain: Brain | null = null;
    let hippocampus: HippocampusNeural | null = null;

    if (parentPort) {
        // console.log('[BrainProcess] Connecting to Mothership (Main Process)...');
        logger.info('Brain Process Online and Listening.');

        // Initialize brain here, as it's used within this block
        try {
            // console.log('[BrainProcess] Inflating Brain (Loading models)...');
            brain = new Brain();
            // console.log('[BrainProcess] Brain Inflated.');
            
            // console.log('[BrainProcess] Connecting Hippocampus (LanceDB)...');
            hippocampus = new HippocampusNeural(brain);
            // console.log('[BrainProcess] Hippocampus Attached.');
        } catch (initError: unknown) {
            console.error('[BrainProcess] Initialization Failed:', initError);
        }

        parentPort.on('message', async (message) => {
        const { id, type, payload } = message; // Worker threads pass message object directly

        if (type === 'ask') {
            try {
                // Determine mode (default to local if not specified)
                const mode = payload.mode || 'local';
                const prompt = payload.prompt;
                const options = payload.options || {};
                
                logger.info(`Thinking about: "${prompt.slice(0, 50)}..." [Mode: ${mode}]`);

                // RAG: Neural Recall
                let memories: string[] = [];
                if (hippocampus && hippocampus.isReady()) {
                    try {
                       memories = await hippocampus.recall(prompt);
                       logger.info(`Recalled ${memories.length} memories.`);
                    } catch (e) {
                        logger.error(`Recall Failed: ${e}`);
                    }
                }

                // Augment Options
                const askOptions = { ...options, memories };
                
                // Generate Response
                const answer = await brain!.ask(prompt, mode, askOptions);
                
                // Memory Consolidation (Async)
                if (hippocampus && hippocampus.isReady()) {
                    // We await here for stability in tests, though could fire-and-forget in high-load prod
                    try {
                       await hippocampus.remember(prompt); 
                       await hippocampus.remember(answer); 
                    } catch (e) {
                        logger.error(`Consolidation Failed: ${e}`);
                    }
                }
                
                logger.info(`Answer generated (${answer.length} chars)`);

                if (parentPort) parentPort.postMessage({ id, success: true, payload: answer });
            } catch (error: any) {
                logger.error(`Brain Freeze: ${error.message}`);
                if (parentPort) parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'remember') {
            try {
                await hippocampus!.remember(payload.text);
                if (parentPort) parentPort.postMessage({ id, success: true, payload: 'Remembered.' });
            } catch (error: any) {
                 if (parentPort) parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'recall') {
             try {
                const memories = await hippocampus!.recall(payload.query);
                if (parentPort) parentPort.postMessage({ id, success: true, payload: memories });
            } catch (error: any) {
                 if (parentPort) parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'status') {
             // Return readiness of components
             if (parentPort) parentPort.postMessage({ 
                 id, 
                 success: true, 
                 payload: {
                     brain: !!brain,
                     hippocampus: !!hippocampus && hippocampus.isReady()
                 }
             });
        }
    });
}

} catch (err: any) {
    logger.error(`Critical Failure in Brain Process Scope: ${err.message}`);
}
