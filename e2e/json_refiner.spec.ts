
import { test, expect } from '@playwright/test';

test.describe('eCy OS JSON Refiner Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open JSON Refiner (Index 5: Calc, Term, Editor, Conv, Regex, JSON)
    // Dock Icons: 0=Calc, 1=Term, 2=Editor, 3=Conv, 4=Regex, 5=JSONRefiner
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(5).click();
    
    // Check title
    await expect(page.getByText('JSON Refiner')).toBeVisible();
  });

  test('1. Valid JSON Formatting', async ({ page }) => {
    // Default text is valid JSON.
    await expect(page.getByText('Valid JSON')).toBeVisible();
    
    // Click Format button
    await page.getByRole('button', { name: 'Format' }).click();
    
    // Expect isValid to remain true
    await expect(page.getByText('Valid JSON')).toBeVisible();
    
    // Check if textarea content contains indentation (newlines)
    const val = await page.locator('textarea').inputValue();
    expect(val).toContain('\n');
  });

  test('2. Invalid JSON Detection', async ({ page }) => {
    // Enter invalid JSON
    const input = page.locator('textarea');
    await input.fill('{"key": "value",}'); // Trailing comma error
    
    // Expect Error State
    await expect(page.getByText('Invalid Syntax')).toBeVisible();
    await expect(page.locator('.bg-red-500\\/50')).toBeVisible(); // Error indicator
  });

  test('3. Minify', async ({ page }) => {
    const input = page.locator('textarea');
    await input.fill('{\n  "a": 1\n}');
    
    // Minify
    await page.getByRole('button', { name: 'Minify' }).click();
    
    // Should remove newlines
    const val = await input.inputValue();
    expect(val).toBe('{"a":1}');
  });
});
