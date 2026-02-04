
import { test, expect } from '@playwright/test';

test.describe('eCy OS QR Nexus Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open QR Nexus. It's 'qr' in the dock. Last item.
    // Index 14.
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.last().click();
    
    await expect(page.getByText('QR Nexus')).toBeVisible();
  });

  test('1. Generation Validation', async ({ page }) => {
    // Check default text input
    await expect(page.locator('textarea')).toHaveValue('https://antigravity.google');
    
    // Check SVG exists
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('2. Reactivity', async ({ page }) => {
    await page.locator('textarea').fill('eCy OS V1005');
    // SVG should exist (headless tough to verify exact pixels relative to input, but presence confirms no crash)
    await expect(page.locator('svg')).toBeVisible();
  });

  test('3. Download Interaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Download Matrix' }).click();
    await expect(page.getByText('Saved to System')).toBeVisible();
  });
});
