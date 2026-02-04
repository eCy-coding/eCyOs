
import { test, expect } from '@playwright/test';
import { ContextManager } from '../src/orchestra/context_manager';

// Note: Since this is a pure logic class without Node/Electron specific deps (mostly),
// we can technically test it with standard Jest/Vitest, but our setup is Electron-Playwright.
// To run this in node environment via Playwright test runner, we can import directly.
// However, Playwright tests run in a separate worker. 
// Let's rely on importing the TS source. ts-node is registered.

test.describe('Efficiency Protocol: Context Logic', () => {

  test('Sliding Window: Should prune old messages when limit exceeded', () => {
    // Setup: Limit to ~20 chars (5 tokens) + System Prompt
    // System: "Hi" (2 chars) -> 1 token
    // Limit: 5 tokens.
    // Total capacity: 5 tokens.
    
    // Let's use characters for easier math. 
    // estimateTokens = chars / 4.
    // Let's set maxTokens = 10 (approx 40 chars).
    
    const mgr = new ContextManager("System", 10); 
    // System "System" (6 chars) -> 2 tokens. Remaining: 8 tokens (32 chars).
    
    // Add User Message 1 (10 chars, 3 tokens)
    mgr.add({ role: 'user', content: '1234567890' });
    // Total Used: 2 + 3 = 5. OK.
    expect(mgr.getContext().length).toBe(2); // System + Msg1

    // Add User Message 2 (20 chars, 5 tokens)
    mgr.add({ role: 'assistant', content: '12345678901234567890' });
    // Total Used: 2 + 3 + 5 = 10. AT LIMIT.
    expect(mgr.getContext().length).toBe(3);

    // Add User Message 3 (10 chars, 3 tokens)
    // New demand: 2 + 3 + 5 + 3 = 13. Exceeds 10.
    // Prune Msg 1 (3 tokens). New Total: 2 + 5 + 3 = 10. OK.
    mgr.add({ role: 'user', content: 'ABCDEFGHIJ' });
    
    const context = mgr.getContext();
    expect(context.length).toBe(3); // System + Msg2 + Msg3
    expect(context[1].content).toContain('12345678901234567890'); // Msg 2 should remain
    expect(context[2].content).toContain('ABCDEFGHIJ'); // Msg 3 should be there
    expect(context[0].role).toBe('system'); // System always preserved
  });
});
