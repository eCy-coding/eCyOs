
import { test, expect } from '@playwright/test';

test.describe('eCy OS Unit Converter 10-Step Calibration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'INITIALIZE SYSTEM' }).click();
    
    // Switch to Lab Tools
    await page.getByRole('button', { name: 'Lab Tools' }).click();
    
    // Open Unit Converter (Index 3: Calc, Term, Editor, Converter)
    // Dock order from UtilityDock.tsx: calculator, terminal, editor, converter
    const converterIcon = page.locator('.fixed.bottom-8 button').nth(3);
    await converterIcon.click();
    
    await expect(page.getByText('Universal Dimensional Translator')).toBeVisible();
  });

  test('01. Component Mount & Defaults', async ({ page }) => {
    // Default category is Length, From: mm? No, defined as UNITS.Length[2] = 'm' in useState default?
    // Looking at code: useState(UNITS.Length[2]) -> 'm'
    // To: UNITS.Length[0] -> 'mm'
    
    // Check header
    await expect(page.getByText('Unit Converter')).toBeVisible();
    
    // Check default input value '1'
    await expect(page.locator('input[type="number"]')).toHaveValue('1');
  });

  test('02. Length Conversion (m to km)', async ({ page }) => {
    // Select Category Length (Default)
    
    // Select From: m (default)
    // Select To: km
    // We need to target the selects. 
    // First select is From, Second is To.
    const selects = page.locator('select');
    await selects.first().selectOption('m');
    await selects.nth(1).selectOption('km');
    
    // Set Value 1000
    await page.locator('input[type="number"]').fill('1000');
    
    // Expect 1
    await expect(page.getByText('1', { exact: true })).toBeVisible(); 
    // Or target the result div text specifically: page.locator('.text-cyan-400.font-mono')
  });

  test('03. Mass Conversion (kg to g)', async ({ page }) => {
    // Click Mass Category
    await page.getByRole('button', { name: 'Mass' }).click();
    
    // Select kg -> g
    const selects = page.locator('select');
    await selects.first().selectOption('kg');
    await selects.nth(1).selectOption('g');
    
    await page.locator('input[type="number"]').fill('1');
    
    // Expect 1000
    // The result div shows result
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText('1000');
  });

  test('04. Temperature Conversion (C to F)', async ({ page }) => {
    await page.getByRole('button', { name: 'Temperature' }).click();
    
    const selects = page.locator('select');
    await selects.first().selectOption('degC');
    await selects.nth(1).selectOption('degF');
    
    await page.locator('input[type="number"]').fill('0');
    
    // 0C = 32F
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText('32');
  });

  test('05. Volume Conversion (Liter to Gallon)', async ({ page }) => {
    await page.getByRole('button', { name: 'Volume' }).click();
    
    const selects = page.locator('select');
    await selects.first().selectOption('liter');
    await selects.nth(1).selectOption('gallon');
    
    await page.locator('input[type="number"]').fill('3.78541');
    
    // Approx 1 gallon
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    // We need close to 1. Mathjs might give 0.999999999 or 1.0000004
    // Text exact match might be risky.
    // Let's check contains '1.' or '0.999' or utilize regex
    await expect(resultDiv).toHaveText(/1\.00|0\.999/); 
  });

  test('06. Storage Conversion (GB to MB)', async ({ page }) => {
    await page.getByRole('button', { name: 'Storage' }).click();
    
    // Wait for dropdown to populate with Storage units
    const fromSelect = page.locator('select').first();
    await expect(fromSelect).toHaveValue('B'); // Default first item
    
    await fromSelect.selectOption('GB');
    await page.locator('select').nth(1).selectOption('MB');
    
    // Ensure value is set AFTER units to force calc
    await page.locator('input[type="number"]').fill('1');
    
    // 1 GB = 1000 MB (decimal)
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText('1000');
  });

  test('07. Time Conversion (Year to Day)', async ({ page }) => {
    await page.getByRole('button', { name: 'Time' }).click();
     
    const selects = page.locator('select');
    await selects.first().selectOption('year');
    await selects.nth(1).selectOption('day');
    
    await page.locator('input[type="number"]').fill('1');
    
    // 365 or 365.2425 or 365.25. Mathjs usually 365.25 (Julian) or 365.
    // Let's check loose match
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText(/^365/);
  });

  test('08. Cross-Category Reset', async ({ page }) => {
    // Select Mass
    await page.getByRole('button', { name: 'Mass' }).click();
    
    // Check if dropdowns updated to Mass units
    const options = await page.locator('select').first().locator('option').allInnerTexts();
    expect(options).toContain('kg');
    expect(options).not.toContain('meter');
  });

  test('09. Precision Float Handling', async ({ page }) => {
    await page.getByRole('button', { name: 'Length' }).click();
    
    const selects = page.locator('select');
    await selects.first().selectOption('m');
    await selects.nth(1).selectOption('mm');
    
    await page.locator('input[type="number"]').fill('0.001');
    
    // 0.001m = 1mm
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText('1');
  });

  test('10. Invalid Input Handling', async ({ page }) => {
    await page.locator('input[type="number"]').fill('');
    // Should show empty or ...
    const resultDiv = page.locator('.text-cyan-400.text-2xl');
    await expect(resultDiv).toHaveText('...');
  });

});
