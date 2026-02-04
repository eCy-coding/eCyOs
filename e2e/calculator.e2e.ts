import { test, expect } from '@playwright/test';

test('Calculator addition works in preview page', async ({ page }) => {
  // Navigate to the Calculator Preview page
  await page.goto('http://localhost:5173/calculator-preview');

  // Click buttons: 1 + 2 =
  await page.getByRole('button', { name: '1' }).click();
  await page.getByRole('button', { name: '+' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '=' }).click();

  // Verify display shows 3
  const display = await page.getByTestId('display');
  await expect(display).toHaveText('3');
});

test('Calculator sin function works', async ({ page }) => {
  await page.goto('http://localhost:5173/calculator-preview');
  await page.getByRole('button', { name: 'sin' }).click();
  await page.getByRole('button', { name: '9' }).click();
  await page.getByRole('button', { name: '=' }).click();
  const display = await page.getByTestId('display');
  // sin(9) ≈ 0.4121 (rounded to 4 decimals)
  await expect(display).toHaveText('0.4121');
});
