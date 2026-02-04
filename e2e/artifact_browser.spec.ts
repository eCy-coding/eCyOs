
import { test, expect } from '@playwright/test';

test.describe('eCy OS Artifact Browser Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Artifact Browser. Index 11 likely (last one).
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(11).click();
    
    await expect(page.getByText('Artifact Vault')).toBeVisible();
  });

  test('1. Tree Navigation', async ({ page }) => {
    // Check root folder
    await expect(page.getByText('~/.gemini/antigravity/brain')).toBeVisible();
    
    // Check leaf file (task.md)
    await expect(page.getByText('task.md')).toBeVisible();
  });

  test('2. Preview Rendering', async ({ page }) => {
    // Click task.md
    await page.getByText('task.md').click();
    
    // Check Preview Pane
    await expect(page.getByText('Task Ledger')).toBeVisible(); // Content inside MD
    await expect(page.getByText('Preview Mode')).toBeVisible();
  });
});
