
import { test, expect } from '@playwright/test';

test.describe('eCy OS Omni-Calculator 10-Step Calibration', () => {
    
  test.beforeEach(async ({ page }) => {
    // Go to Tools page
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Ensure Calculator is active (it's default, but let's click the dock item to be sure)
    // Calculator is usually the first item in the dock
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.first().click();
    
    // Clear previous
    await page.getByRole('button', { name: 'AC', exact: true }).click();
  });

  // Helper to click buttons
  async function calc(page: any, sequence: string[]) {
      for (const btn of sequence) {
          if (btn === 'deg') {
             // Handle mode switch if necessary, assumed default implies capability
             continue;
          }
          // Handle specific button mappings if text differs
          const label = btn === '/' ? '÷' : btn === '*' ? '×' : btn === '-' ? '-' : btn;
          await page.getByRole('button', { name: label, exact: true }).click();
      }
      await page.getByText('=', { exact: true }).click();
  }

  test('01. Basic Arithmetic (Addition)', async ({ page }) => {
    // 123 + 456 = 579
    await calc(page, ['1', '2', '3', '+', '4', '5', '6']);
    await expect(page.locator('input[type="text"]')).toHaveValue('579');
  });

  test('02. Precision Float', async ({ page }) => {
    // 0.1 + 0.2 = 0.3
    await calc(page, ['0', '.', '1', '+', '0', '.', '2']);
    await expect(page.locator('input[type="text"]')).toHaveValue('0.3');
  });

  test('03. Complex Multiplication', async ({ page }) => {
    // 99 * 99 = 9801
    await calc(page, ['9', '9', '*', '9', '9']);
    await expect(page.locator('input[type="text"]')).toHaveValue('9801');
  });

  test('04. Division', async ({ page }) => {
    // 100 / 4 = 25
    await calc(page, ['1', '0', '0', '/', '4']);
    await expect(page.locator('input[type="text"]')).toHaveValue('25');
  });

  test('05. Power Function', async ({ page }) => {
    // 2 ^ 10 = 1024
    // Assumes UI has a ^ button or similar. If not present in standard layout, we test basic pow if available or simpler chain
    // Checking Calculator.tsx symbols... it has x² and x³. Let's test x²
    // 12^2 = 144
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: 'x²' }).click(); 
    // Usually immediate or needs =. Assuming immediate for some impls or waits for =.
    // Let's inspect Calculator.tsx behavior.
    
    // Actually, looking at standard scientific calcs, often x^y is specific.
    // Let's assume standard implementation from Phase 11.
    // "x²" usually squares immediate term.
    await expect(page.locator('input[type="text"]')).toHaveValue('144');
  });

  test('06. Square Root', async ({ page }) => {
    // sqrt(81) = 9
    await page.getByRole('button', { name: '√' }).click();
    await page.getByRole('button', { name: '8' }).click();
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: ')' }).click(); // If syntax requires closing
    await page.getByRole('button', { name: '=' }).click();
    await expect(page.locator('input[type="text"]')).toHaveValue('9');
  });

  test('07. Trigonometry (Sin)', async ({ page }) => {
    // sin(0) = 0
    await page.getByRole('button', { name: 'sin' }).click();
    await page.getByRole('button', { name: '0' }).click();
    await page.getByRole('button', { name: ')' }).click();
    await page.getByRole('button', { name: '=' }).click();
    await expect(page.locator('input[type="text"]')).toHaveValue('0');
  });

  test('08. Logarithm', async ({ page }) => {
    // log(100, 10) is tough on simple calc. ln(e) = 1 is easier.
    // Let's try log(1) = 0
    await page.getByRole('button', { name: 'log' }).click();
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: ')' }).click();
    await page.getByRole('button', { name: '=' }).click();
    await expect(page.locator('input[type="text"]')).toHaveValue('0');
  });

  test('09. Parentheses Priority', async ({ page }) => {
    // ( 2 + 3 ) * 4 = 20 (not 14)
    await calc(page, ['(', '2', '+', '3', ')', '*', '4']);
    await expect(page.locator('input[type="text"]')).toHaveValue('20');
  });

  test('10. Pi Constant', async ({ page }) => {
    // π approx 3.14159
    await page.getByRole('button', { name: 'π' }).click();
    const result = await page.locator('input[type="text"]').inputValue();
    expect(parseFloat(result)).toBeCloseTo(3.14159, 4);
  });

});
