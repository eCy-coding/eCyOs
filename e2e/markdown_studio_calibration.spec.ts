
import { test, expect } from '@playwright/test';

test.describe('eCy OS Markdown Studio 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Landing Page -> Enter System -> Agentic Workspace -> Lab Tools -> Markdown Studio
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    
    // Switch to Lab Tools
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Click 'Editor' in Utility Dock (Index 2: Calculator, Terminal, Editor)
    // Dock is fixed at bottom.
    const editorDockItem = page.locator('.fixed.bottom-8 button').nth(2);
    await editorDockItem.click();
    
    // Verify Header
    await expect(page.getByText('MD Studio')).toBeVisible();
    await page.waitForSelector('.monaco-editor');
  });

  test('01. Component Mount', async ({ page }) => {
    await expect(page.locator('.monaco-editor')).toBeVisible();
    await expect(page.getByText('Rendered View')).toBeVisible();
  });

  test('02. Input Text Injection', async ({ page }) => {
    // Focus Editor
    await page.locator('.monaco-editor').click();
    await page.waitForTimeout(500); // Wait for focus
    
    // Select All and Delete (Try both Meta+A and Control+A for robustness)
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // Type new text with delay
    await page.keyboard.type('# eCy OS Unit Test', { delay: 100 });
    await page.waitForTimeout(1000); // Wait for React state update/debounce
    
    // Verify Preview
    // First h1 should match. Note: Default content has h1 too.
    await expect(page.locator('.prose h1').first()).toHaveText('eCy OS Unit Test');
  });

  test('03. Live Preview Update', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    await page.keyboard.type('**Bold Text**', { delay: 50 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.prose strong')).toHaveText('Bold Text');
  });

  test('04. Toolbar Bold Action', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    
    // Click Bold Button in Toolbar
    await page.getByTitle('Bold').click();
    await page.waitForTimeout(500);
    
    // Should insert **Bold**
    await expect(page.locator('.prose strong')).toHaveText('Bold');
  });

  test('05. Toolbar Italic Action', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    
    await page.getByTitle('Italic').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.prose em')).toHaveText('Italic');
  });

  test('06. Code Block Rendering', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    
    const code = '```javascript\nconsole.log(1);\n```';
    await page.keyboard.type(code, { delay: 20 });
    await page.waitForTimeout(1000);
    
    // Check for pre/code block and highlighting class
    await expect(page.locator('.prose pre code.language-javascript')).toBeVisible();
  });

  test('07. List Rendering', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    
    await page.keyboard.type('- Item 1\n- Item 2', { delay: 50 });
    await page.waitForTimeout(500);
    
    const items = page.locator('.prose ul li');
    await expect(items).toHaveCount(2);
  });

  test('08. Split View Toggle', async ({ page }) => {
    // Default is 'Split' (Both)
    // Click 'Editor'
    await page.getByRole('button', { name: 'Editor' }).click();
    await expect(page.getByText('Rendered View')).not.toBeVisible();
    
    // Click 'Preview'
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.locator('.monaco-editor')).not.toBeVisible();
    
    // Back to Split
    await page.getByRole('button', { name: 'Split' }).click();
    await expect(page.getByText('Rendered View')).toBeVisible();
  });

  test('09. Link Generation', async ({ page }) => {
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    
    await page.getByTitle('Link').click();
    // Inserts [Link](url)
    await page.waitForTimeout(500);
    
    await expect(page.locator('.prose a')).toHaveAttribute('href', 'url');
  });

  test('10. Save Action (Simulation)', async ({ page }) => {
    // The save button exists but mainly logs/does nothing in this version or calls a handler.
    // We verify it is clickable and doesn't crash.
    await page.locator('button svg.lucide-save').locator('..').click();
    // If no error, we pass.
    await expect(page.getByText('MD Studio')).toBeVisible();
  });

});
