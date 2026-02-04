
import { test, expect } from '@playwright/test';

test.describe('eCy OS DocuVault Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open DocuVault. 
    // Button likely has Database icon or similar. 
    // Let's assume index 10 (Calc..Debate, DocuVault).
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(10).click();
    
    await expect(page.getByText('DocuVault')).toBeVisible();
  });

  test('1. File Listing', async ({ page }) => {
    // Should see initial files
    await expect(page.getByText('Strategic_Report_v2.md')).toBeVisible();
    await expect(page.getByText('AI_Ethics_Guidelines.pdf')).toBeVisible();
  });

  test('2. Upload Simulation', async ({ page }) => {
    // Click Upload
    await page.getByRole('button', { name: 'Upload' }).first().click();
    
    // Should see "Upload_" file appear
    await expect(page.locator('text=/Upload_/')).toBeVisible();
    
    // Wait for processing logic (1s -> processing, 4s -> indexed)
    // We can just verify it appeared for now.
    await expect(page.locator('text=queued')).toBeVisible();
  });

  test('3. Filtering', async ({ page }) => {
    await page.getByText('PDFs').click();
    // Should hide md file
    await expect(page.getByText('Strategic_Report_v2.md')).not.toBeVisible();
    // Should show pdf
    await expect(page.getByText('AI_Ethics_Guidelines.pdf')).toBeVisible();
  });
});
