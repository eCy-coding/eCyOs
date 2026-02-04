
import { parentPort, workerData } from 'worker_threads';

/**
 * Agent Worker (The Neuron)
 * -------------------------
 * A specialized worker thread representing a single autonomous agent.
 * It maintains a persona (system prompt) and converses via the Main Nervous System.
 */

if (!parentPort) throw new Error('AgentWorker must be spawned as a Worker Thread');

const { role, systemPrompt, name } = workerData;

// console.log(`[${role}] Agent Online. Persona Loaded.`);

const conversationHistory: { role: string, content: string }[] = [
    { role: 'system', content: systemPrompt }
];

parentPort.on('message', async (message) => {
    const { id, type, payload } = message;

    if (type === 'ask') {
        const { prompt } = payload;
        // console.log(`[${name}] Received prompt: "${prompt.slice(0, 50)}..."`);
        
        // Add user prompt to history
        conversationHistory.push({ role: 'user', content: prompt });

        try {
            // Request Inference from Nervous System
            parentPort!.postMessage({
                id,
                type: 'inference_request',
                payload: {
                    history: conversationHistory,
                    model: 'qwen2.5:7b' 
                }
            });

        } catch (error: any) {
            console.error(`[${name}] Processing Error: ${error.message}`);
            parentPort!.postMessage({ id, success: false, error: error.message });
        }
    } else if (type === 'inference_response') {
        const { originalId, response } = payload;
        
        // console.log(`[${name}] Inference received. Length: ${response.length}`);
        
        // Add assistant response to history
        conversationHistory.push({ role: 'assistant', content: response });

        // Reply to Main
        parentPort!.postMessage({
            id: originalId,
            success: true,
            payload: { response }
        });
    }
});
