
import Store from 'electron-store';

/**
 * Type Definition for our Application Store
 */
interface AppSchema {
    theme: 'light' | 'dark' | 'system';
    windowBounds: {
        width: number;
        height: number;
        x?: number;
        y?: number;
    };
    ai: {
        lastModel: string;
        autoCloudFallback: boolean;
    };
}

/**
 * Persistent Store (The Hippocampus)
 * ----------------------------------
 * Handles long-term memory of application state.
 */
export class PersistentStore {
    private store: Store<AppSchema>;

    constructor() {
        this.store = new Store<AppSchema>({
            projectName: 'ankara',
            name: 'ankara-config',
            defaults: {
                theme: 'system',
                windowBounds: { width: 1200, height: 800 },
                ai: {
                    lastModel: 'qwen2.5:7b',
                    autoCloudFallback: true
                }
            }
        });
    }

    public get<K extends keyof AppSchema>(key: K): AppSchema[K] {
        return (this.store as any).get(key);
    }

    public set<K extends keyof AppSchema>(key: K, value: AppSchema[K]): void {
        (this.store as any).set(key, value);
    }
}
