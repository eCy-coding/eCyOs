
import { test, expect } from '@playwright/test';

test.describe('eCy OS Terminal Nexus 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    
    // Open Terminal via Global Toggle ($_)
    await page.getByTitle('Toggle System Shell').click();
    await page.waitForTimeout(1000); // Wait for AnimatePresence
    await page.waitForSelector('.xterm-screen');
  });

  test('01. Terminal Mount', async ({ page }) => {
    // Check wrapper first
    await expect(page.locator('.xterm-screen')).toBeVisible();
  });

  test('02. Header Identity', async ({ page }) => {
    await expect(page.getByText('SYSTEM_SHELL')).toBeVisible();
  });

  test('03. Connection State (Offline Check)', async ({ page }) => {
    // In E2E without backend, it should show OFFLINE or NO SIGNAL
    // The code shows 'OFFLINE' in header and 'NO SIGNAL' in body if not connected.
    // We accept either depending on race condition of WS connection attempt.
    const headerStatus = page.getByText('OFFLINE');
    await expect(headerStatus).toBeVisible();
  });

  test('04. Maximize Toggle', async ({ page }) => {
    const maximizeBtn = page.locator('button svg.lucide-maximize2').locator('..');
    await maximizeBtn.click();
    // Check if it creates a fixed inset style (based on code `fixed inset-4`)
    const container = page.locator('div.fixed.inset-4');
    await expect(container).toBeVisible();
  });

  test('05. Minimize Toggle', async ({ page }) => {
    // Maximize first
    const toggleBtn = page.locator('div.handle button').first(); // The maximize/minimize button is the first one
    await toggleBtn.click();
    
    // Now it should show Minimize icon
    const minimizeIcon = page.locator('svg.lucide-minimize2');
    await expect(minimizeIcon).toBeVisible();
    
    // Click again to minimize
    await toggleBtn.click();
    
    // Should verify it's no longer full screen (not fixed inset-4)
    // The component defaults to `h-64 sm:h-80`
    await expect(page.locator('div.h-64')).toBeVisible(); 
  });

  test('06. XTerm Cursor Layer', async ({ page }) => {
    // Needs focus to show cursor sometimes
    await page.locator('.xterm-screen').click();
    await expect(page.locator('.xterm-cursor-layer')).toBeVisible();
  });

  test('07. Canvas Dimensions', async ({ page }) => {
    const canvas = page.locator('.xterm-screen canvas').first();
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });

  test('08. Close Button Interaction', async ({ page }) => {
    // Click the X button
    const closeBtn = page.locator('button svg.lucide-x').locator('..');
    await closeBtn.click();
    
    // Terminal should disappear
    await expect(page.locator('.xterm-screen')).not.toBeVisible();
  });

  test('09. Global Re-Open', async ({ page }) => {
    // Close it first
    await page.getByTitle('Toggle System Shell').click(); // Toggles off
    await expect(page.locator('.xterm-screen')).not.toBeVisible();
    
    // Open again
    await page.getByTitle('Toggle System Shell').click();
    await expect(page.locator('.xterm-screen')).toBeVisible();
  });

  test('10. Focus Handling', async ({ page }) => {
    // Click on the terminal body
    await page.locator('.xterm-screen').click();
    
    // Use xterm helper to check focus class usually `.xterm-focused`
    // Or check if textarea (xterm hidden input) is focused
    await expect(page.locator('textarea.xterm-helper-textarea')).toBeFocused();
  });

});
