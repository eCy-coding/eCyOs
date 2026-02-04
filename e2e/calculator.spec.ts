import { test, expect } from '@playwright/test';

test.describe('Calculator E2E Tests - 10 Different Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/calculator');
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Basic Addition - 123 + 456 = 579', async ({ page }) => {
    await page.click('text=1');
    await page.click('text=2');
    await page.click('text=3');
    await page.click('text=+');
    await page.click('text=4');
    await page.click('text=5');
    await page.click('text=6');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('579');
  });

  test('Test 2: Complex Expression - (5+3)×2-10÷2 = 11', async ({ page }) => {
    // 5 + 3 = 8
    await page.click('text=5');
    await page.click('text=+');
    await page.click('text=3');
    await page.click('text==');
    
    let display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('8');
    
    // 8 × 2 = 16
    await page.click('text=×');
    await page.click('text=2');
    await page.click('text==');
    
    display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('16');
    
    // 10 ÷ 2 = 5
    await page.click('text=AC');
    await page.click('text=1');
    await page.click('text=0');
    await page.click('text=÷');
    await page.click('text=2');
    await page.click('text==');
    
    display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('5');
    
    // 16 - 5 = 11
    await page.click('text=AC');
    await page.click('text=1');
    await page.click('text=6');
    await page.click('text=−');
    await page.click('text=5');
    await page.click('text==');
    
    display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('11');
  });

  test('Test 3: Trigonometric - sin(30°) ≈ 0.5', async ({ page }) => {
    await page.click('text=3');
    await page.click('text=0');
    await page.click('text=sin');
    
    const display = await page.getByTestId('calculator-display').textContent();
    const result = parseFloat(display!);
    expect(result).toBeCloseTo(0.5, 2);
  });

  test('Test 4: Logarithmic - log(100) = 2', async ({ page }) => {
    await page.click('text=1');
    await page.click('text=0');
    await page.click('text=0');
    await page.click('text=log');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('2');
  });

  test('Test 5: Square Root - √144 = 12', async ({ page }) => {
    await page.click('text=1');
    await page.click('text=4');
    await page.click('text=4');
    await page.click('text=√');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('12');
  });

  test('Test 6: Exponential - 2^8 = 256', async ({ page }) => {
    await page.click('text=2');
    await page.click('text=x^y');
    await page.click('text=8');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('256');
  });

  test('Test 7: Memory Operations - 5+3(M+), 10×MR = 80', async ({ page }) => {
    // 5 + 3 = 8
    await page.click('text=5');
    await page.click('text=+');
    await page.click('text=3');
    await page.click('text==');
    
    // Store in memory
    await page.click('text=M+');
    
    // 10 × MR
    await page.click('text=AC');
    await page.click('text=1');
    await page.click('text=0');
    await page.click('text=×');
    await page.click('text=MR');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('80');
  });

  test('Test 8: Decimal Precision - 0.1 + 0.2 = 0.3', async ({ page }) => {
    await page.click('text=0');
    await page.click('text=.');
    await page.click('text=1');
    await page.click('text=+');
    await page.click('text=0');
    await page.click('text=.');
    await page.click('text=2');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    const result = parseFloat(display!);
    expect(result).toBeCloseTo(0.3, 10);
  });

  test('Test 9: Large Numbers - 999999 + 1 = 1000000', async ({ page }) => {
    await page.click('text=9');
    await page.click('text=9');
    await page.click('text=9');
    await page.click('text=9');
    await page.click('text=9');
    await page.click('text=9');
    await page.click('text=+');
    await page.click('text=1');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('1000000');
  });

  test('Test 10: Edge Case - 1 ÷ 0 = NaN/Error', async ({ page }) => {
    await page.click('text=1');
    await page.click('text=÷');
    await page.click('text=0');
    await page.click('text==');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toContain('NaN');
  });

  test('Keyboard Navigation - Test keyboard input', async ({ page }) => {
    await page.keyboard.type('123');
    await page.keyboard.press('+');
    await page.keyboard.type('456');
    await page.keyboard.press('Enter');
    
    const display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('579');
  });

  test('Clear Functions - Test AC and CE', async ({ page }) => {
    await page.click('text=5');
    await page.click('text=+');
    await page.click('text=3');
    
    // CE clears current entry
    await page.click('text=CE');
    let display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('0');
    
    // AC clears everything
    await page.click('text=7');
    await page.click('text=+');
    await page.click('text=8');
    await page.click('text=AC');
    display = await page.getByTestId('calculator-display').textContent();
    expect(display).toBe('0');
  });
});
