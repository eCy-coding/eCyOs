
import { test, expect } from '@playwright/test';

test.describe('eCy OS Diff Lens Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Diff Lens. It's 'diff' in the dock.
    // Index roughly 13 (Calc, Term, Editor, Conv, Regex, Json, Clock, Net, Color, Debate, Docs, Art, Crypto, Diff)
    // Order in APPS:
    // 0: Calc
    // 1: Term
    // 2: Editor
    // 3: Conv
    // 4: Regex
    // 5: Json
    // 6: Clock
    // 7: Net
    // 8: Color
    // 9: Debate
    // 10: Docs
    // 11: Artifacts
    // 12: Crypto
    // 13: Diff
    // So index 13 should be it.
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(13).click();
    
    await expect(page.getByText('Diff Lens')).toBeVisible();
  });

  test('1. Comparison Logic', async ({ page }) => {
    // Should see default text
    await expect(page.locator('text=Original Source')).toBeVisible();
    await expect(page.locator('text=Modified Source')).toBeVisible();
    
    // Check visual output contains "Hello Universe" (modified part)
    await expect(page.locator('.border-l-2.border-green-500')).toContainText('Hello Universe');
    
    // Check deletion (Hello World)
    await expect(page.locator('.line-through')).toContainText('Hello World');
  });

  test('2. Live Updates', async ({ page }) => {
    // Change modified text
    const modifiedArea = page.locator('textarea').nth(1);
    await modifiedArea.fill('New Content');
    
    // Check output updates
    await expect(page.locator('.border-l-2.border-green-500')).toContainText('New Content');
  });
});
