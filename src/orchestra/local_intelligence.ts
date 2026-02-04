
import http from 'http';

/**
 * Local Intelligence (The Cerebellum)
 * -----------------------------------
 * Interface for local Ollama instance.
 * Provides fast, offline, and private inference.
 */
export class LocalIntelligence {
    private model: string;
    private static readonly HOST = '127.0.0.1';
    private static readonly PORT = 11434;
    private static readonly PATH = '/api/generate';
    private cache: Map<string, string> = new Map();
    private static readonly CACHE_LIMIT = 100;

    constructor(model: string = 'qwen2.5:7b') {
        this.model = model;
    }

    /**
     * Checks if Ollama is running and the model is available.
     */
    public async isReady(): Promise<boolean> {
        return new Promise((resolve) => {
            const req = http.request({
                host: LocalIntelligence.HOST,
                port: LocalIntelligence.PORT,
                path: '/api/tags',
                method: 'GET'
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.end();
        });
    }

    /**
     * Asks the local model a question.
     * @param prompt User prompt
     * @param system System instruction
     * @param options Additional options (e.g. format: 'json')
     */
    public async ask(prompt: string, system: string = "", options: any = {}): Promise<string> {
        const cacheKey = `${prompt}:${system}:${JSON.stringify(options)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                model: this.model,
                prompt: prompt,
                system: system,
                stream: false,
                ...options 
            });

            const requestOptions = {
                hostname: LocalIntelligence.HOST,
                port: LocalIntelligence.PORT,
                path: LocalIntelligence.PATH,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(requestOptions, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(body);
                            const answer = response.response;
                            // Cache Success
                            if (this.cache.size >= LocalIntelligence.CACHE_LIMIT) {
                                const firstKey = this.cache.keys().next().value;
                                if (firstKey) this.cache.delete(firstKey);
                            }
                            this.cache.set(cacheKey, answer);
                            
                            resolve(answer);
                        } catch (e) {
                            reject(new Error('Failed to parse Ollama response'));
                        }
                    } else {
                        reject(new Error(`Ollama Error ${res.statusCode}: ${body}`));
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    }

    /**
     * Generates an embedding for the given text.
     * @param text Text to embed
     */
    public async embed(text: string): Promise<number[]> {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                model: this.model,
                prompt: text
            });

            const requestOptions = {
                hostname: LocalIntelligence.HOST,
                port: LocalIntelligence.PORT,
                path: '/api/embeddings',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };

            const req = http.request(requestOptions, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(body);
                            resolve(response.embedding);
                        } catch (e) {
                            reject(new Error('Failed to parse Embedding response'));
                        }
                    } else {
                        reject(new Error(`Ollama Embedding Error ${res.statusCode}: ${body}`));
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    }

    /**
     * Asks the local model a question with streaming response.
     */
    public async askStream(prompt: string, onToken: (token: string) => void, system: string = "", options: any = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                model: this.model,
                prompt: prompt,
                system: system,
                stream: true,
                ...options
            });

            const requestOptions = {
                hostname: LocalIntelligence.HOST,
                port: LocalIntelligence.PORT,
                path: LocalIntelligence.PATH,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };

            const req = http.request(requestOptions, (res) => {
                let buffer = '';
                const BATCH_SIZE = 50; 

                res.on('data', chunk => {
                    const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                buffer += json.response;
                                if (buffer.length >= BATCH_SIZE) {
                                    onToken(buffer);
                                    buffer = '';
                                }
                            }
                            if (json.done) {
                                if (buffer.length > 0) onToken(buffer);
                            }
                        } catch (e) { }
                    }
                });

                res.on('end', () => {
                    if (buffer.length > 0) onToken(buffer);
                    if (res.statusCode === 200) resolve();
                    else reject(new Error(`Ollama Stream Error ${res.statusCode}`));
                });
            });

            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    }
}
