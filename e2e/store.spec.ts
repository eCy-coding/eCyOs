
import { test, expect } from '@playwright/test';
import { PersistentStore } from '../src/stage/main/store';

test.describe.skip('Ecosystem Integration: PersistentStore', () => {
    test('Should save and retrieve values', () => {
        // Initialize Store (This creates config.json in userdata usually, or temp in test)
        const store = new PersistentStore();
        
        // 1. Check Defaults
        expect(store.get('theme')).toBe('system');
        
        // 2. Modify Value
        store.set('theme', 'dark');
        expect(store.get('theme')).toBe('dark');
        
        // 3. Modify Nested Value (AI)
        const aiConfig = store.get('ai');
        expect(aiConfig.lastModel).toBe('qwen2.5:7b');
        
        store.set('ai', { lastModel: 'gpt-4o', autoCloudFallback: false });
        expect(store.get('ai').lastModel).toBe('gpt-4o');
    });
});
