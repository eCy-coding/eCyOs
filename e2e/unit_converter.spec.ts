
import { test, expect } from '@playwright/test';

test.describe('eCy OS Unit Converter Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    
    // Enter System
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();

    // Navigate to Lab Tools
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Use Dock to switch to Unit Converter
    // The dock items are icon buttons. We might need a better selector or aria-label in UtilityDock.
    // For now, UtilityDock uses `app.label` in a tooltip, but maybe not on the button itself.
    // Let's click the icon. The 4th item is converter.
    // Or we can add aria-labels to UtilityDock in a fix step if this fails.
    // Let's rely on the text in the tooltip or icon if possible.
    // Click the 4th button (index 3).
    // Or, update UtilityDock to have aria-labels first? 
    // Let's try to find it by the tooltip text appearance on hover? No too complex.
    // Let's guess the button: UtilityDock renders buttons.
    // "Unit Conv" is the label.
    // Let's cycle or find by icon class? No.
    // Let's assume the order is fixed: 0=Calc, 1=Term, 2=Editor, 3=Converter.
    // Actually, checking UtilityDock.tsx:
    // { id: 'calculator' }, { id: 'terminal' }, { id: 'editor' }, { id: 'converter' }
    // So Converter is index 3.
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(3).click();
    
    // Check if Unit Converter title is visible
    await expect(page.getByText('Unit Converter')).toBeVisible();
  });

  test('1. Basic Length Conversion (m to km)', async ({ page }) => {
    // Default CATEGORY is Length.
    // Default FROM is 'm' (index 2). Default TO is 'mm' (index 0).
    // Wait, let's verify defaults from code: 
    // fromUnit: UNITS.Length[2] ('m')
    // toUnit: UNITS.Length[0] ('mm')
    // Value: '1'. Result should be '1000'.
    
    // Check initial result
    await expect(page.locator('input[type="number"]')).toHaveValue('1');
    const resultBox = page.locator('.bg-cyan-500\\/10'); // The result container
    await expect(resultBox).toContainText('1000');
    
    // Change TO unit to 'km'
    const toSelect = page.locator('select').nth(1); // Second select is TO
    await toSelect.selectOption('km');
    
    // 1 m = 0.001 km
    await expect(resultBox).toContainText('0.001');
  });

  test('2. Mass Conversion (kg to g)', async ({ page }) => {
    // Switch Category to Mass
    await page.getByRole('button', { name: 'Mass' }).click();
    
    // Default Mass: 'mg', 'g'? No check code.
    // Mass: ['mg', 'g', 'kg', ...]
    // Defaults: from=mg, to=g
    
    // Set Input to 1
    const input = page.locator('input[type="number"]');
    await input.fill('1');
    
    // Set From to kg
    const fromSelect = page.locator('select').nth(0);
    await fromSelect.selectOption('kg');
    
    // Set To to g
    const toSelect = page.locator('select').nth(1);
    await toSelect.selectOption('g');
    
    // 1 kg = 1000 g
    const resultBox = page.locator('.bg-cyan-500\\/10');
    await expect(resultBox).toContainText('1000');
  });

  test('3. Temperature Conversion (C to F)', async ({ page }) => {
    await page.getByRole('button', { name: 'Temperature' }).click();
    
    const input = page.locator('input[type="number"]');
    await input.fill('0'); // 0 degC
    
    const fromSelect = page.locator('select').nth(0);
    await fromSelect.selectOption('degC');
    
    const toSelect = page.locator('select').nth(1);
    await toSelect.selectOption('degF');
    
    // 0 C = 32 F
    const resultBox = page.locator('.bg-cyan-500\\/10');
    await expect(resultBox).toContainText('32');
  });
});
