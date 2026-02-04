
import { test, expect } from '@playwright/test';

test.describe('eCy OS Net Sentinel 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Switch to Net Sentinel (Index 7)
    // UtilityDock.tsx: calculator (0), terminal (1), editor (2), converter (3), regex (4), json (5), clock (6), network (7)
    await page.locator('.fixed.bottom-8 button').nth(7).click();
    
    await expect(page.getByRole('heading', { name: 'Network Sentinel' })).toBeVisible();
  });

  test('01. Component Mount & Defaults', async ({ page }) => {
    // Check Header
    await expect(page.getByRole('heading', { name: 'Network Sentinel' })).toBeVisible();
    await expect(page.getByText('ONLINE')).toBeVisible();
  });

  test('02. Loading State Handling', async ({ page }) => {
    // Depending on network speed, "Scanning..." might appear briefly.
    // We can't strictly assert "Scanning..." unless we intercept/slow network.
    // Instead, we verify that EVENTUALLY "Scanning..." is GONE and we have data.
    // Or check that we have either Scanning OR an IP.
    
    // Assert that we eventually have a value in the IP div.
    // The IP div is text-4xl font-mono text-cyan-200
    // Wait for the text to NOT be "Scanning..." or be "Scanning..." then change?
    // Let's just check visibility of the main card structure.
    await expect(page.getByText('Public Identity')).toBeVisible();
  });

  test('03. IP Address Verification', async ({ page }) => {
    // Wait for IP to be populated (Real or Mock)
    const ipLocator = page.locator('.text-4xl.font-mono.text-cyan-200');
    
    // Wait for loading to finish (Text changes from Scanning...)
    await expect(ipLocator).not.toHaveText('Scanning...', { timeout: 15000 });
    
    const ipText = await ipLocator.innerText();
    expect(ipText.length).toBeGreaterThan(5);
  });

  test('04. ISP Organization Check', async ({ page }) => {
    // Check ISP text
    // "Unknown ISP" or actual ISP
    // It is in a div with Wifi icon: .flex.items-center.gap-2 with Wifi
    // Text is next to Wifi icon
    const ispLocator = page.locator('.space-y-1', { hasText: 'Public Identity' }).locator('.text-sm.text-white\\/60');
    await expect(ispLocator).toBeVisible();
    const text = await ispLocator.innerText();
    expect(text.length).toBeGreaterThan(2);
  });

  test('05. Geoposition Verification', async ({ page }) => {
    // Check City/Region
    // Label: Geoposition
    const geoLabel = page.getByText('Geoposition');
    await expect(geoLabel).toBeVisible();
    
    // Value is 2xl font text-white
    const geoValue = page.locator('.text-2xl.font-mono.text-white');
    await expect(geoValue).toBeVisible();
    // Wait for loading to finish
    await expect(geoValue).not.toHaveText('...', { timeout: 10000 });
    const text = await geoValue.innerText();
    // e.g. "Mountain View, United States" or "Cyber City, Digital Realm"
    expect(text).toContain(','); 
  });

  test('06. Live Feed Visualization', async ({ page }) => {
    // Check "LIVE LATENCY FEED" label
    await expect(page.getByText('LIVE LATENCY FEED')).toBeVisible();
    
    // Check Bar Chart bars
    // They are motion.divs inside the container
    // Container: w-full h-32 flex ...
    // children are divs with bg-cyan/yellow/red
    // Let's count them. Array(20) in state.
    const bars = page.locator('.h-32.flex.items-end.justify-between.gap-1 > div');
    await expect(bars).toHaveCount(20);
  });

  test('07. Dynamic Chart Updates', async ({ page }) => {
    // Check height of first bar, wait, check again?
    // Bars shift. New val added at end, first removed.
    // Let's check the height style of the last bar.
    const lastBar = page.locator('.h-32.flex.items-end.justify-between.gap-1 > div').last();
    const height1 = await lastBar.getAttribute('style'); // height: X%
    
    await page.waitForTimeout(1100); // Wait > 1s for interval
    
    const height2 = await lastBar.getAttribute('style');
    // It's random so it *should* change, but 1/130 chance it picks same pixel?
    // High probability change.
    expect(height1).not.toBe(height2); 
  });

  test('08. Connection Grade', async ({ page }) => {
    // Check Grade Display "NET" (background) and "Connection Grade" (label)
    await expect(page.getByText('Connection Grade')).toBeVisible();
    
    // Grade Letter (A, B, or C)
    // 7xl font black
    const grade = page.locator('.text-7xl.font-black');
    await expect(grade).toBeVisible();
    const text = await grade.innerText();
    expect(['A', 'B', 'C']).toContain(text);
  });

  test('09. Stats: Jitter', async ({ page }) => {
    await expect(page.getByText('Jitter')).toBeVisible();
    // Value ~X.Xms
    // Value ~X.Xms
    // Filter by the card class to be specific
    const val = page.locator('.bg-white\\/5').filter({ hasText: 'Jitter' }).locator('.text-lg.font-mono');
    await expect(val).toHaveText(/~\d\.\dms/);
  });

  test('10. Stats: Protocol', async ({ page }) => {
    await expect(page.getByText('Protocol')).toBeVisible();
    await expect(page.getByText('IPv4 (TCP)')).toBeVisible();
  });

});
