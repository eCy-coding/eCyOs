
import https from 'https';

/**
 * Cloud Intelligence (The Uplink)
 * -------------------------------
 * Connects to OpenRouter for advanced AI capabilities.
 */
export class CloudIntelligence {
    private apiKey: string;
    private static readonly ENDPOINT = 'openrouter.ai';
    private static readonly PATH = '/api/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Sends a prompt to the cloud AI.
     * @param model Model ID (default: google/gemini-2.0-flash-exp:free or openai/gpt-4o-mini)
     * @param system System prompt
     * @param user User prompt
     * @returns Promise resolving to the answer string
     */
    public async ask(user: string, system: string = "You are a helpful assistant.", model: string = "openai/gpt-4o-mini"): Promise<string> {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ]
            });

            const options = {
                hostname: CloudIntelligence.ENDPOINT,
                path: CloudIntelligence.PATH,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://antigravity.dev', // Required by OpenRouter
                    'X-Title': 'Antigravity Protocol'
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const response = JSON.parse(body);
                            const content = response.choices?.[0]?.message?.content;
                            if (content) resolve(content);
                            else reject(new Error('No content in response: ' + body));
                        } catch (e) {
                            reject(new Error('Failed to parse JSON: ' + e));
                        }
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${body}`));
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    }
}
