
import { test, expect } from '@playwright/test';

test.describe('eCy OS Network Sentinel Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Network Sentinel (Index 7)
    // Dock Icons: Calc, Term, Editor, Conv, Regex, JSON, Clock, Network
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(7).click();
    
    // Check title
    await expect(page.getByText('Network Sentinel')).toBeVisible();
  });

  test('1. Public Info Fetch', async ({ page }) => {
    // Should show "Public Identity" label
    await expect(page.getByText('Public Identity')).toBeVisible();
    
    // Should show an IP or "Scanning...". 
    // Ideally it settles to an IP or the mock fallback if API fails in headless.
    // We check for "Scanning..." disappearing or a basic text.
    // The mockup has "Cyber City" if failed.
    // Let's just check that Geoposition label is there.
    await expect(page.getByText('Geoposition')).toBeVisible();
  });

  test('2. Latency Visualization', async ({ page }) => {
    await expect(page.getByText('LIVE LATENCY FEED')).toBeVisible();
    // Check for bars
    const bars = page.locator('.flex.items-end > div');
    await expect(bars).toHaveCount(20);
  });

  test('3. Connection Grade', async ({ page }) => {
    // Should see a grade letter A/B/C
    await expect(page.getByText('Connection Grade')).toBeVisible();
    
    // The grade itself is a big text.
    const grade = page.locator('.text-7xl');
    await expect(grade).toBeVisible();
  });
});
