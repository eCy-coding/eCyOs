
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Efficiency Protocol: Graph Algorithms', () => {
  let electronApp: unknown;
  let window: unknown;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js')],
      env: { NODE_ENV: 'test' }
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('Dependency Graph: Should detect cycle and sort correctly', async () => {
    // 1. Create Tasks
    const t1 = await window.evaluate((t) => window.stage.orchestra.task.add(t), { name: 'A', command: 'echo A', icon: 'A' });
    const t2 = await window.evaluate((t) => window.stage.orchestra.task.add(t), { name: 'B', command: 'echo B', icon: 'B' });
    const t3 = await window.evaluate((t) => window.stage.orchestra.task.add(t), { name: 'C', command: 'echo C', icon: 'C' });
    
    // 2. Add Dependencies: A -> B -> C
    // We want execution order: A then B then C.
    // So B depends on A. C depends on B.
    
    // Add B -> A (B depends on A)
    const res1 = await window.evaluate(({ dep, parent }) => window.stage.orchestra.task.dependency.add(dep, parent), 
        { dep: t2.id, parent: t1.id });
    expect(res1.success).toBe(true);
    
    // Add C -> B (C depends on B)
    const res2 = await window.evaluate(({ dep, parent }) => window.stage.orchestra.task.dependency.add(dep, parent), 
        { dep: t3.id, parent: t2.id });
    expect(res2.success).toBe(true);
    
    // 3. Verify Execution Order
    const ordered = await window.evaluate(() => window.stage.orchestra.task.listOrdered());
    expect(ordered).not.toBeNull();
    
    // In topological sort:
    // A (0 deps) -> B (1 dep: A) -> C (1 dep: B)
    // Order should be A, B, C.
    // Note: The sort returns "execution order", so independent first.
    
    const ids = ordered.map((t: unknown) => t.id);
    expect(ids.indexOf(t1.id)).toBeLessThan(ids.indexOf(t2.id));
    expect(ids.indexOf(t2.id)).toBeLessThan(ids.indexOf(t3.id));

    // 4. Verify Cycle Detection
    // Try adding A -> C (A depends on C).
    // This creates A <- B <- C <- A loop.
    const resCycle = await window.evaluate(({ dep, parent }) => window.stage.orchestra.task.dependency.add(dep, parent), 
        { dep: t1.id, parent: t3.id });
    
    expect(resCycle.success).toBe(false);
    expect(resCycle.error).toContain('Cycle detected');
  });

  test('Fuzzy Search: Should find task matching query', async () => {
    // 1. Create a specific task
    await window.evaluate((t) => window.stage.orchestra.task.add(t), { name: 'Deploy to Production', command: 'echo deploy', icon: '🚀' });
    
    // 2. Search with typo "Deplo" (partial)
    const res1 = await window.evaluate((q) => window.stage.orchestra.task.search(q), 'Deplo');
    expect(res1.length).toBeGreaterThan(0);
    expect(res1[0].name).toBe('Deploy to Production');

    // 3. Search with typo "Deploy to Prodction" (Levenshtein match)
    // Distance should be 1 (missing 'u')
    const res2 = await window.evaluate((q) => window.stage.orchestra.task.search(q), 'Deploy to Prodction');
    expect(res2.length).toBeGreaterThan(0);
    expect(res2[0].name).toBe('Deploy to Production');
    
    // 4. Search with unrelated nonsense
    const res3 = await window.evaluate((q) => window.stage.orchestra.task.search(q), 'BananaSandwich');
    // Should be empty or very low relevance if threshold allows, but default threshold 5 on "BananaSandwich" vs "Deploy to Production" (length diff is large) shouldn't match.
    // "Deploy to Production" is 20 chars. "BananaSandwich" is 14. Diff is huge.
    // Let's check if it returns nothing or just low rank. With strict threshold it should be empty.
    // Actually, my implementation has a default threshold of 5.
    // Levenshtein("Deploy to Production", "bananasandwich") is likely > 5.
    const match = res3.find(t => t.name === 'Deploy to Production');
    expect(match).toBeUndefined();
  });
});
