
// Access parentPort directly from the global process object in Utility Process
// @ts-ignore (process.parentPort is an Electron extension)
const parentPort = process.parentPort;

import { chromium, Browser, Page } from 'playwright';
import { Logger } from './logger';

/**
 * The Eye (Vision Process)
 * ------------------------
 * Dedicated Utility Process for Autonomous Web Navigation.
 * Uses Playwright (Headless Chromium).
 */

const logger = new Logger('eye-process');

process.on('uncaughtException', (err) => logger.error(`Critical Vision Failure: ${err.message}`));
process.on('unhandledRejection', (reason) => logger.error(`Unhandled Vision Rejection: ${reason}`));

let browser: Browser | null = null;
let activePage: Page | null = null;

async function getBrowser(): Promise<Browser> {
    if (!browser) {
        logger.info('Opening Eyes (Launching Chromium)...');
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Critical for Electron environment
        });
    }
    return browser;
}

if (parentPort) {
    logger.info('Vision Process Online and Watching.');

    parentPort.on('message', async (e) => {
        const { id, type, payload } = e.data;

        if (type === 'browse') {
            try {
                const url = payload.url;
                if (!url) throw new Error('Target URL required');
                
                logger.info(`Navigating to ${url}...`);

                const browser = await getBrowser();
                
                // Close existing page if any
                if (activePage) {
                    await activePage.close().catch(() => {});
                }

                const context = await browser.newContext();
                activePage = await context.newPage();

                await activePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                
                const title = await activePage.title();
                const content = await activePage.innerText('body'); 
                
                logger.info(`Vision Successful: "${title}" (${content.length} chars)`);

                parentPort.postMessage({
                    id,
                    success: true,
                    payload: {
                        title,
                        text: content.slice(0, 10000)
                    }
                });

            } catch (error: any) {
                logger.error(`Vision Blurred: ${error.message}`);
                parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'click') {
            try {
                if (!activePage) throw new Error('No active page found');
                
                await activePage.click(payload.selector);
                logger.info(`Clicked: ${payload.selector}`);
                parentPort.postMessage({ id, success: true, payload: 'Clicked' });
            } catch (error: any) {
                logger.error(`Vision Failed: ${error.message}`);
                parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'type') {
             try {
                if (!activePage) throw new Error('No active page found');
                
                await activePage.fill(payload.selector, payload.text);
                logger.info(`Typed into ${payload.selector}`);
                parentPort.postMessage({ id, success: true, payload: 'Typed' });
            } catch (error: any) {
                logger.error(`Vision Failed: ${error.message}`);
                parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'screenshot') {
             try {
                if (!activePage) throw new Error('No active page found');
                
                const buffer = await activePage.screenshot();
                const base64 = buffer.toString('base64');
                logger.info(`Screenshot taken`);
                parentPort.postMessage({ id, success: true, payload: base64 });
            } catch (error: any) {
                logger.error(`Vision Failed: ${error.message}`);
                parentPort.postMessage({ id, success: false, error: error.message });
            }
        } else if (type === 'analyze') {
            try {
                if (!activePage) throw new Error('No active page found');

                // 1. Inject TensorFlow.js and backend
                // In production, these should be bundled. For now, we use CDN injection for simplicity
                // or read from node_modules if we want to be offline-strict.
                // Since we installed them, we can try to find the path, BUT
                // executing node_modules script in browser context is tricky without bundler.
                // We will use the CDN method for the dynamic injection for now as per plan, 
                // but we can also map the file via Playwright's addScriptTag if we resolve the path.
                
                // Using CDN for guaranteed browser compatibility without complex build mapping
                logger.info('Injecting Visual Cortex (TF.js)...');
                await activePage.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js' });
                await activePage.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgpu@4.17.0/dist/tf-backend-webgpu.min.js' });

                // 2. Perform Analysis
                const result = await activePage.evaluate(async () => {
                    // @ts-ignore
                    const tf = window.tf;
                    if (!tf) return { error: 'TF.js failed to load' };

                    // Set backend to WebGPU
                    await tf.setBackend('webgpu');
                    await tf.ready(); // Ensure backend is initialized 
                    const backend = tf.getBackend();
                    
                    // Simple Tensor Operation to prove GPU usage
                    // (Real classification requires loading a model, which is heavy for this step)
                    // We generate a random tensor and do a matrix multiplication
                    const a = tf.randomNormal([100, 100]);
                    const b = tf.randomNormal([100, 100]);
                    const c = a.matMul(b);
                    const shape = c.shape;
                    const data = await c.data(); // sync GPU download

                    return {
                        backend,
                        tensorShape: shape,
                        sampleValue: data[0]
                    };
                });

                logger.info(`Visual Cortex Analysis Complete. Backend: ${result.backend}`);
                parentPort.postMessage({ id, success: true, payload: result });

            } catch (error: any) {
                logger.error(`Visual Cortex Failure: ${error.message}`);
                parentPort.postMessage({ id, success: false, error: error.message });
            }
        }
    });
}
