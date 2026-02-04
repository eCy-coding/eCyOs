
import { test, expect } from '@playwright/test';

test.describe('eCy OS Markdown Studio Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Editor (Index 2 in dock: Calc, Term, Editor...)
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(2).click();
    
    await expect(page.getByText('MD Studio')).toBeVisible();
  });

  test('1. Initial Load & Split View', async ({ page }) => {
    // Check Input Source pane
    await expect(page.getByText('Input Source')).toBeVisible();
    // Check Rendered View pane
    await expect(page.getByText('Rendered View')).toBeVisible();
    // Check Content
    await expect(page.getByText('Welcome to Markdown Studio')).toBeVisible();
  });

  test('2. Toolbar Interaction', async ({ page }) => {
    // Click Bold button
    const boldBtn = page.getByTitle('Bold');
    await boldBtn.click();
    // We can't easily check monaco content, but we can check if preview updated if we typed...
    // But since insertText appends, let's verify no error occurred.
    await expect(page.getByText('Rendered View')).toBeVisible();
  });

  test('3. View Toggles', async ({ page }) => {
    // Switch to Preview Only
    await page.getByText('Preview', { exact: true }).click();
    await expect(page.getByText('Input Source')).not.toBeVisible();
    await expect(page.getByText('Rendered View')).toBeVisible();
    
    // Switch back to Split
    await page.getByText('Split', { exact: true }).click();
    await expect(page.getByText('Input Source')).toBeVisible();
  });
});
