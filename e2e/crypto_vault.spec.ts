
import { test, expect } from '@playwright/test';

test.describe('eCy OS Crypto Vault Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Crypto Vault. It's 'crypto' in the dock.
    // Index roughly 12 (Calc, Term, Editor, Conv, Regex, Json, Clock, Net, Color, Debate, Docs, Art, Crypto)
    // Wait, the order in UtilityDock.tsx is:
    // Calc, Term, Editor, Converter, Regex, JSON, Clock, Network, Color, Crypto, Diff...
    // Let's count:
    // 0: Calc
    // 1: Term
    // 2: Editor
    // 3: Conv
    // 4: Regex
    // 5: Json
    // 6: Clock
    // 7: Network
    // 8: Color
    // 9: Crypto  <-- Wait, the previous steps assumed indexes 10, 11 for Debate/Docs/Artifacts...
    // Ah, `UtilityDock` list in the file I viewed matches `APPS` constant:
    // Calc, Term, Editor, Converter, Regex, JSON, Clock, Network, Color, Crypto, Diff.
    // WHERE ARE DEBATE, DOCS, ARTIFACTS?
    // THEY ARE NOT IN THE `APPS` ARRAY IN UTILITY DOCK I SAW JUST NOW!
    // I MISSED THEM! The code I viewed in step 690 showed:
    // Calc, Term, Editor, Converter, Regex, Json, Clock, Net, Color, Crypto, Diff.
    // It DOES NOT have Debate, Docs, Artifacts. 
    // This means those previous tests (step 656, 664, 673) likely FAILED or clicked wrong buttons if I used indexes 9, 10, 11 which map to something else.
    // Index 9 is Crypto! 
    // I need to add Debate, Docs, Artifacts to the `APPS` list in Utility Dock now, alongside Crypto.
    
    // BUT first, let's target Crypto which IS in the list at index 9.
    const dockButtons = page.locator('.fixed.bottom-8 button');
    await dockButtons.nth(9).click();
    
    await expect(page.getByText('Crypto Vault')).toBeVisible();
  });

  test('1. Encrypt Simulation', async ({ page }) => {
    // Type in textarea
    await page.locator('textarea').fill('Secret Message');
    
    // Click Generate Key
    await page.getByTitle('Generate Random Key').click();
    
    // Click Execute
    await page.getByRole('button', { name: 'Execute Protocol' }).click();
    
    // Check Output
    await expect(page.getByText('Output Generated')).toBeVisible({ timeout: 10000 });
  });

  test('2. Hash Mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Hash' }).click();
    // Key input should disappear
    await expect(page.getByPlaceholder('Enter secret key...')).not.toBeVisible();
  });
});
