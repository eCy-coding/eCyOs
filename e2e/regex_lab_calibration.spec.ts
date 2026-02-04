
import { test, expect } from '@playwright/test';

test.describe('eCy OS Regex Lab 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Switch to Regex Lab
    // Regex is usually index 4 or 'regex' in generic id search
    // UtilityDock.tsx: calculator (0), terminal (1), editor (2), converter (3), regex (4)
    await page.locator('.fixed.bottom-8 button').nth(4).click();
    
    await expect(page.getByText('Regex Laboratory')).toBeVisible();
  });

  test('01. Component Mount & Defaults', async ({ page }) => {
    // Check Header
    await expect(page.getByText('Pattern Matching & Analysis Engine')).toBeVisible();
    
    // Check Default Pattern Input
    await expect(page.locator('input[placeholder="regex pattern"]')).toHaveValue('[A-Z]\\w+');
    
    // Check Default Test String
    await expect(page.locator('textarea')).toContainText('Hello World');
  });

  test('02. Basic Pattern Matching', async ({ page }) => {
    // Set Pattern: Hello
    await page.locator('input[placeholder="regex pattern"]').fill('Hello');
    
    // Verify Matches Count (in label)
    // Label structure: Matches <span ...>1</span>
    await expect(page.getByText('Matches 1', { exact: false })).toBeVisible();
    
    // Verify Highlight
    // Look for .bg-cyan-500/30 or just text presence in highlight area
    // The visualization area contains spans.
    // Matched span has title="Match 1"
    await expect(page.locator('span[title="Match 1"]')).toHaveText('Hello');
  });

  test('03. No Match Handling', async ({ page }) => {
    await page.locator('input[placeholder="regex pattern"]').fill('XYZ123');
    
    // Matches 0
    await expect(page.getByText('Matches 0', { exact: false })).toBeVisible();
    
    // Check for "No matches found" text
    await expect(page.getByText('No matches found.')).toBeVisible();
  });

  test('04. Flag Toggle (Case Insensitive)', async ({ page }) => {
    // Pattern: hello (lowercase)
    await page.locator('input[placeholder="regex pattern"]').fill('hello');
    
    // Test String contains "Hello" (Uppercase H)
    // Default valid matches: 0 (case sensitive)
    await expect(page.getByText('Matches 0')).toBeVisible();
    
    // Click 'i' flag
    await page.getByRole('button', { name: 'i', exact: true }).click();
    
    // Matches should be 1 now
    await expect(page.getByText('Matches 1')).toBeVisible();
  });

  test('05. Global Flag Analysis', async ({ page }) => {
    // Test String: Hello World (contains 2 'o's)
    await page.locator('textarea').fill('foo bar baz foo');
    
    // Pattern: foo
    await page.locator('input[placeholder="regex pattern"]').fill('foo');
    
    // Ensure 'g' is active (default is active). 
    // If not active, click it. But default state has 'g' in flags.
    // Check if 'g' button has active class usually provided by tailwind conditional.
    // Or just check matches.
    // Should match 2 'foo's.
    await expect(page.getByText('Matches 2')).toBeVisible();
    
    // Verify match chips in Analysis panel
    await expect(page.locator('.text-pink-400', { hasText: 'Match 1' })).toBeVisible();
    await expect(page.locator('.text-pink-400', { hasText: 'Match 2' })).toBeVisible();
  });

  test('06. Group Capture Verification', async ({ page }) => {
    // Pattern: (\w+) (\d+)
    await page.locator('input[placeholder="regex pattern"]').fill('(\\w+) (\\d+)');
    
    // Test String: Order 66
    await page.locator('textarea').fill('Order 66');
    
    // Matches 1
    await expect(page.getByText('Matches 1')).toBeVisible();
    
    // Check Analysis Panel for Groups
    // The UI renders groups as [Order] [66]
    await expect(page.getByText('Groups: [Order] [66]')).toBeVisible();
  });

  test('07. Error Handling (Invalid Regex)', async ({ page }) => {
    // Invalid Regex: [A- (unclosed class)
    await page.locator('input[placeholder="regex pattern"]').fill('[A-');
    
    // Verify Error Message
    // Verify Error Message
    // Container matches text-red-400 but might have children with same class. 
    // Target the specific error text span or the container with AlertCircle
    await expect(page.locator('.bg-red-500\\/10')).toBeVisible(); // Target the background class which is unique to error box
    // Message depends on browser engine usually "Invalid regular expression" or similar
    // We just check visibility of error container
  });

  test('08. Copy Functionality', async ({ page }) => {
    // Click Copy Button
    // Button wraps a Copy icon. locate by class or finding button near "Matches"
    const copyBtn = page.locator('button').filter({ has: page.locator('svg.lucide-copy') });
    
    // Should show check icon after click (transition to Check)
    // Or we rely on component implementation: setIsCopied(true) renders <Check />
    // We might need to click the *only* button in that header row.
    // The header row: "Matches ... <button>"
    // Use correct selector for Copy button
    await page.locator('button').filter({ has: page.locator('svg.lucide-copy') }).click();
    
    // Check for Check icon
    await expect(page.locator('svg.lucide-check')).toBeVisible();
  });

  test('09. Dynamic String Update', async ({ page }) => {
    await page.locator('input[placeholder="regex pattern"]').fill('test');
    
    await page.locator('textarea').fill('This is a test');
    await expect(page.getByText('Matches 1')).toBeVisible();
    
    await page.locator('textarea').fill('This is a demo');
    await expect(page.getByText('Matches 0')).toBeVisible();
  });

  test('10. Flag Combination (Global + Insensitive)', async ({ page }) => {
    await page.locator('textarea').fill('AAA aaa AaA');
    await page.locator('input[placeholder="regex pattern"]').fill('a');
    
    // Default 'g' is on. 'i' is off.
    // Matches: 5 ('a' in aaa(3) and AaA(2 upper excluded? No, lowercase a matches lowercase a).
    // Wait. Pattern 'a'.
    // aaa -> 3 matches.
    // AaA -> 1 match (middle a).
    // AAA -> 0 matches.
    // Total 4 matches initially?
    
    // Let's enable 'i'.
    const iFlag = page.getByRole('button', { name: 'i', exact: true });
    await iFlag.click();
    
    // Now should match ALL 'a's (case insensitive).
    // AAA (3) + aaa (3) + AaA (3) = 9 matches.
    await expect(page.getByText('Matches 9')).toBeVisible();
  });

});
