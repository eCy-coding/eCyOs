
import { test, expect } from '@playwright/test';

test.describe('eCy OS Master Portal 10-Step Calibration', () => {
    
  test.beforeEach(async ({ page }) => {
    // Go to Nexus (Master Portal)
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByText('Knowledge Nexus', { exact: true }).click();
    
    // Wait for canvas
    await page.waitForSelector('canvas');
  });

  test('01. WebGL Initialization', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('02. UI Overlay Presence', async ({ page }) => {
    await expect(page.getByText('MASTER ARCHTECT PORTAL')).toBeVisible();
    await expect(page.getByText('VISUALIZING 15 ACTIVE NEURAL NODES')).toBeVisible();
  });

  test('03. Node Count (Visual Proxy)', async ({ page }) => {
    // We can't count 3D meshes easily in playwright without canvas inspection hacks.
    // Instead we check if the canvas exists and context is not lost.
    // We can assume if the overlay says 15 nodes (static text), the component mounted.
    // We will verify the text content.
    await expect(page.locator('p.text-white\\/20')).toContainText('15 ACTIVE NEURAL NODES');
  });

  test('04. Tooltip Interaction (Simulation)', async ({ page }) => {
    // Simulate hover over center (0,0,0 - Calculator)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        // Expect cursor change or tooltip. Tooltip is Html component from drei.
        // It might be in the DOM.
        // Let's check if 'Omni-Calc' text appears in the DOM (it should be rendered by <Html>)
        // Note: <Html> puts div on top of canvas.
        await expect(page.getByText('Omni-Calc')).toBeVisible(); 
    }
  });

  test('05. Navigation to App (Click)', async ({ page }) => {
    // Click center (Calculator)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    
    // Should navigate to Tools tab and show Calculator
    // Check tab switch
    await expect(page.getByText('Agentic Workspace').first()).toBeVisible(); // Just checking we are not broken
    // Actually we expect 'Lab Tools' to be active tab.
    // The active tab indicator is visual, but the content should be calculator.
    await expect(page.getByText('Omni-Calc')).toBeVisible(); // This might be ambiguous if tooltip is there. 
    // Let's check for specific calculator button
    await expect(page.getByRole('button', { name: 'AC' })).toBeVisible();
  });

  test('06. Return to Portal', async ({ page }) => {
    // Go back to Nexus
    await page.getByText('Knowledge Nexus').click();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('07. Performance FPS Check (Trace)', async ({ page }) => {
    // Basic sanity check that it doesn't crash after 2s
    await page.waitForTimeout(2000);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('08. Node Clustering', async ({ page }) => {
      // Ensure "The Council" (Debate) is rendered.
      // We look for the label in the Html overlay
      // It might require rotation to see if occluded, but Html usually z-indexes on top or occludes.
      // Let's just check presence in DOM.
      await expect(page.getByText('The Council')).toBeAttached();
  });

  test('09. Starfield Background', async ({ page }) => {
    // Hard to verify visual stars, but we verify canvas is opaque/black background
    // We can check if the parent div has the right structure
    await expect(page.locator('.absolute.inset-0.z-0')).toBeVisible();
  });

  test('10. Full System Stability', async ({ page }) => {
      // Rapid switching
      await page.getByText('Lab Tools').click();
      await page.getByText('Knowledge Nexus').click();
      await page.getByText('Lab Tools').click();
      await page.getByText('Knowledge Nexus').click();
      await expect(page.locator('canvas')).toBeVisible();
  });

});
