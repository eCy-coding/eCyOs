
import { test, expect } from '@playwright/test';

test.describe('eCy OS Regex Lab Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Regex Lab (Index 4: Calc, Term, Editor, Conv, Regex)
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(4).click();
    
    // Check title
    await expect(page.getByText('Regex Laboratory')).toBeVisible();
  });

  test('1. Basic Matching', async ({ page }) => {
    // Default pattern: [A-Z]\w+
    // Default string: Hello World...
    // Should match "Hello", "World" etc.
    
    // Check for match highlights
    const highlights = page.locator('.bg-cyan-500\\/30');
    await expect(highlights.first()).toContainText('Hello');
    await expect(highlights.nth(1)).toContainText('World');
  });

  test('2. Flag Toggling (Case Insensitive)', async ({ page }) => {
    // Change pattern to "hello"
    const input = page.getByPlaceholder('regex pattern');
    await input.fill('hello');
    
    // Default is usually 'g'. 'i' is off.
    // "hello" matches nothing in "Hello World..." case sensitive.
    const highlights = page.locator('.bg-cyan-500\\/30');
    await expect(highlights).toHaveCount(0);
    
    // Toggle 'i' flag
    await page.getByRole('button', { name: 'i', exact: true }).click();
    
    // Should now match "Hello"
    await expect(highlights.first()).toContainText('Hello');
  });

  test('3. Error Handling', async ({ page }) => {
    // Invalid Regex: [A-Z
    const input = page.getByPlaceholder('regex pattern');
    await input.fill('[A-Z');
    
    // Error message should appear
    await expect(page.locator('.text-red-400')).toBeVisible();
    await expect(page.getByText('Invalid regular expression')).toBeVisible();
  });
});
