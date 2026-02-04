
/**
 * The Immune System
 * -----------------
 * Provides resilience and self-healing capabilities (Retries, Circuit Breakers).
 */
export class ImmuneSystem {
    /**
     * Retry a function N times with exponential backoff.
     * @param fn The async function to retry.
     * @param retries Number of retries.
     * @param delayMs Initial delay in ms.
     */
    public static async retry<T>(fn: () => Promise<T>, retries: number = 3, delayMs: number = 500): Promise<T> {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (e) {
                lastError = e;
                await new Promise(res => setTimeout(res, delayMs * Math.pow(2, i)));
            }
        }
        throw lastError;
    }
}
