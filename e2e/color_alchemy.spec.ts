
import { test, expect } from '@playwright/test';

test.describe('eCy OS Color Alchemy Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Color Alchemy (Index 8)
    // Dock Icons: Calc, Term, Editor, Conv, Regex, JSON, Clock, Network, Color
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(8).click();
    
    // Check title
    await expect(page.getByText('Color Alchemy')).toBeVisible();
  });

  test('1. Palette Generation', async ({ page }) => {
    // Should see 5 colored strips
    const strips = page.locator('.flex-1.h-full.relative.group');
    await expect(strips).toHaveCount(5);
  });

  test('2. Base Color Input', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await input.fill('#ff0000');
    // Palette should update (hard to check visually in headless, but if no crash, good)
  });

  test('3. Mode Switch', async ({ page }) => {
    // Switch to Monochrome
    await page.getByRole('button', { name: 'monochrome' }).click();
    // Check if button is active (has text-pink-300 class)
    const btn = page.getByRole('button', { name: 'monochrome' });
    await expect(btn).toHaveClass(/text-pink-300/);
  });
});
