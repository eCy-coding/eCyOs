
import { test, expect } from '@playwright/test';

test.describe('eCy OS Color Alchemy 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => console.log(`PAGE LOG [${msg.type()}]: ${msg.text()}`));
    
    await page.goto('http://localhost:5183');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Switch to Color Alchemy (Index 8)
    // UtilityDock.tsx: calculator (0), terminal (1), editor (2), converter (3), regex (4), json (5), clock (6), network (7), color (8)
    await page.locator('.fixed.bottom-8 button').nth(8).click();
    
    await expect(page.getByRole('heading', { name: 'Color Alchemy' })).toBeVisible();
  });

  test('01. Component Mount & Defaults', async ({ page }) => {
    // Check Header
    await expect(page.getByRole('heading', { name: 'Color Alchemy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Randomize' })).toBeVisible();
  });

  test('02. Palette Generation (Default)', async ({ page }) => {
    // Container: flex-1 rounded-2xl overflow-hidden flex shadow-2xl ring-1 ring-white/10
    const container = page.locator('.ring-1.ring-white\\/10');
    await expect(container).toBeVisible();
    
    // Check direct children count
    const bars = container.locator('> div');
    await expect(bars).toHaveCount(5);
  });

  test('03. Base Color Input Validation', async ({ page }) => {
    // Check text input
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    const val = await input.inputValue();
    expect(val).toMatch(/^#[0-9a-fA-F]{6}$/); // Hex format
  });

  test('04. Mode Switching: Monochrome', async ({ page }) => {
    // Click Monochrome
    await page.getByRole('button', { name: 'monochrome' }).click();
    
    // Button should be active (pink border/text)
    // Class contains 'border-pink-500'
    const btn = page.getByRole('button', { name: 'monochrome' });
    await expect(btn).toHaveClass(/border-pink-500/);
    
    // Verify palette changed? Hard to prove without initial state capture.
    // Just verify 5 bars exist.
    const bars = page.locator('.ring-1.ring-white\\/10 > div');
    await expect(bars).toHaveCount(5);
  });

  test('05. Mode Switching: Complementary', async ({ page }) => {
    // Click Complementary
    await page.getByRole('button', { name: 'complementary' }).click();
    const btn = page.getByRole('button', { name: 'complementary' });
    await expect(btn).toHaveClass(/border-pink-500/);
  });

  test('06. Manual Hex Input Logic', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill('#ff0000');
    // Trigger change? React input needs clear/fill. Playwright .fill does this.
    // Check color bars - first bar or base color usage?
    // In code: baseColor drives generation. 
    // Wait for effect.
    await page.waitForTimeout(500);
    
    // Check if input value persists
    expect(await input.inputValue()).toBe('#ff0000');
    
    // Check first bar color style? Or component logic?
    // Scale usually starts with base or derives.
    // Just verifying input interaction works without crash.
  });

  test('07. Copy to Clipboard Feedback', async ({ page }) => {
    // Click first color bar
    const firstBar = page.locator('.ring-1.ring-white\\/10 > div').first();
    await firstBar.click();
    
    // Verify Check icon appears
    // The bar has a child div with opacity transition.
    // It contains Check icon when copiedIndex matched.
    // Selector: svg.lucide-check
    await expect(page.locator('svg.lucide-check').first()).toBeVisible();
  });

  test('08. Contrast Metrics Display', async ({ page }) => {
    // Check for "Contrast (vs Black)" labels
    const labels = page.getByText('Contrast (vs Black)');
    await expect(labels).toHaveCount(5);
    
    // Check values (some number)
    // We can just check that 5 metric cards exist.
    const cards = page.locator('.bg-white\\/5.border.border-white\\/10');
    // There are 5 cards in the bottom grid.
    // Also input panel uses similar classes? No, input panel is inputs.
    // Bottom grid is distinct.
    // Let's count cards matching text.
    await expect(cards.filter({ hasText: 'Contrast' })).toHaveCount(5);
  });

  test('09. Randomize Function', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    const oldVal = await input.inputValue();
    
    await page.getByRole('button', { name: 'Randomize' }).click();
    
    // Wait for state update
    await page.waitForTimeout(500);
    
    const newVal = await input.inputValue();
    expect(newVal).not.toBe(oldVal);
  });

  test('10. Layout Stability', async ({ page }) => {
    // Switch modes rapidly and ensure header stays visible
    await page.getByRole('button', { name: 'monochrome' }).click();
    // Avoid 'random' button ambiguity with 'Randomize'
    await page.getByRole('button', { name: 'complementary' }).click();
    await page.getByRole('button', { name: 'analogous' }).click();
    
    await expect(page.getByRole('heading', { name: 'Color Alchemy' })).toBeVisible();
  });

});
