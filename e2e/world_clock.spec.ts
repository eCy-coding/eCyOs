
import { test, expect } from '@playwright/test';

test.describe('eCy OS World Clock Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open World Clock (Index 6: Calc, Term, Editor, Conv, Regex, JSON, Clock)
    // Dock Order: Calc, Term, Editor, Conv, Regex, JSON, Clock
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(6).click();
    
    // Check title
    await expect(page.getByText('World Chronos')).toBeVisible();
  });

  test('1. Time Cards Visibility', async ({ page }) => {
    await expect(page.getByText('Local Info')).toBeVisible();
    await expect(page.getByText('New York')).toBeVisible();
    await expect(page.getByText('London')).toBeVisible();
    await expect(page.getByText('Tokyo')).toBeVisible();
  });

  test('2. Globe Canvas Rendering', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // can't easily check content of canvas, but presence is good enough for now.
  });

  test('3. Pomodoro Timer', async ({ page }) => {
    // Check initial state
    await expect(page.getByText('25:00')).toBeVisible();
    await expect(page.getByText('MODE: FOCUS')).toBeVisible();
    
    // Start Timer
    const playBtn = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
    await playBtn.click();
    
    // Check that button changed to Pause
    await expect(page.locator('svg.lucide-pause')).toBeVisible();
    
    // Reset
    const resetBtn = page.locator('button').filter({ has: page.locator('svg.lucide-rotate-ccw') });
    await resetBtn.click();
    
    // Should be back to 25:00 and Play button
    await expect(page.getByText('25:00')).toBeVisible();
    await expect(page.locator('svg.lucide-play')).toBeVisible();
  });
});
