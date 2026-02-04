
import { test, expect } from '@playwright/test';

test.describe('eCy OS JSON Refiner 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Switch to JSON Refiner
    // UtilityDock.tsx: calculator (0), terminal (1), editor (2), converter (3), regex (4), json (5)
    await page.locator('.fixed.bottom-8 button').nth(5).click();
    
    await expect(page.getByText('Validator • Formatter • Minifier')).toBeVisible();
  });

  test('01. Component Mount & Defaults', async ({ page }) => {
    // Check Header
    await expect(page.getByRole('heading', { name: 'JSON Refiner' })).toBeVisible();
    
    // Check Default Textarea content (should be valid JSON)
    const val = await page.locator('textarea').inputValue();
    expect(val).toContain('eCy OS');
    
    // Check Status Indicator "Valid JSON"
    await expect(page.getByText('Valid JSON')).toBeVisible();
  });

  test('02. Valid JSON Validation', async ({ page }) => {
    await page.locator('textarea').fill('{"valid": true}');
    
    // Should show Valid JSON and green indicator
    await expect(page.getByText('Valid JSON')).toBeVisible();
    await expect(page.locator('.text-green-400 .bg-green-500')).toBeVisible();
  });

  test('03. Invalid JSON Handling', async ({ page }) => {
    await page.locator('textarea').fill('{"invalid": true,'); // trailing comma
    
    // Should show Invalid Syntax
    // Should show Invalid Syntax
    await expect(page.getByText('Invalid Syntax')).toBeVisible();
    // Scope dot to the container with the text
    // Scope dot to the container with the text using specific footer classes
    await expect(page.locator('.text-red-400 .bg-red-500')).toBeVisible();
  });

  test('04. Error Overlay Verification', async ({ page }) => {
    await page.locator('textarea').fill('{"a": 1'); // Unclosed brace
    
    // Error message should appear at bottom with AlertCircle
    // Using class selector based on component code: .bg-red-500/20
    await expect(page.locator('div.bg-red-500\\/20')).toBeVisible();
    
    // Check specific error text if possible (browser dependent, usually "Unexpected end of JSON input" or "Expected ...")
    // Just verify the container is visible.
  });

  test('05. Auto-Fix Functionality (Single Quotes)', async ({ page }) => {
    // Fill with single quotes (invalid JSON standard)
    await page.locator('textarea').fill("{'key': 'value'}");
    
    await expect(page.getByText('Invalid Syntax')).toBeVisible();
    
    // Click Auto Fix
    await page.getByRole('button', { name: 'Auto Fix' }).click();
    
    // Should pass now
    await expect(page.getByText('Valid JSON')).toBeVisible();
    
    // Value should differ
    const val = await page.locator('textarea').inputValue();
    expect(val).toContain('"key": "value"');
  });

  test('06. Format (Prettify) Action', async ({ page }) => {
    await page.locator('textarea').fill('{"a":1,"b":2}');
    
    // Click Format
    await page.getByRole('button', { name: 'Format' }).click();
    
    // Value should span multiple lines or have spaces
    const val = await page.locator('textarea').inputValue();
    const lines = val.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });

  test('07. Minify Action', async ({ page }) => {
    await page.locator('textarea').fill('{\n  "a": 1\n}');
    
    // Click Minify
    await page.getByRole('button', { name: 'Minify' }).click();
    
    // Value should be single line/compact
    const val = await page.locator('textarea').inputValue();
    expect(val).toBe('{"a":1}');
    // Or '{"a":1}' depending on spacing.
  });

  test('08. Copy Functionality', async ({ page }) => {
    // Hover over editor area to show copy button
    await page.locator('textarea').hover();
    
    // Click Copy (Copy Icon)
    // The button has specific styles, verify via icon
    const copyBtn = page.locator('button').filter({ has: page.locator('svg.lucide-copy') });
    await copyBtn.click({ force: true }); // Bypass hover opacity delay if needed
    
    // Verify icon change to Check
    await expect(page.locator('svg.lucide-check')).toBeVisible();
  });

  test('09. Character Count Update', async ({ page }) => {
    await page.locator('textarea').fill('12345');
    // Footer should match "5 chars"
    await expect(page.getByText('5 chars')).toBeVisible();
  });

  test('10. Large Data Handling', async ({ page }) => {
    // Generate large JSON
    const large = JSON.stringify(Array.from({length: 100}, (_,i) => ({id: i})), null, 2);
    // Use clipboard paste or fill
    // Fill might be slow for huge text in Playwright, but 100 items is okay.
    await page.locator('textarea').fill(large);
    
    await expect(page.getByText('Valid JSON')).toBeVisible();
    
    // Minify it
    await page.getByRole('button', { name: 'Minify' }).click();
    await expect(page.getByText('Valid JSON')).toBeVisible();
  });

});
