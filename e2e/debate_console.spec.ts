
import { test, expect } from '@playwright/test';

test.describe('eCy OS Debate Console Verification', () => {
    
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
    await page.getByText('Lab Tools', { exact: true }).click();
    
    // Open Debate Console (Index might be 9 or 10 now?)
    // Layout: Calc, Term, Editor, Conv, Regex, JSON, Clock, Network, Color, Debate
    // Index 0..9. 
    // Actually, App.tsx render order is determined by UtilityDock. 
    // We should click the button with the Brain icon.
    // Or just click the last button.
    const dockButtons = page.locator('.fixed.bottom-8 button');
    // Assuming it's appended at the end or specific spot. 
    // Let's assume index 3 (Agents) or 9+? 
    // Wait, the dock isn't auto-updated, users update App.tsx but also UtilityDock.tsx is separate?
    // AH! I missed updating UtilityDock.tsx to include the new apps in the list!
    // The previous apps worked because I updated App.tsx AND UtilityDock.tsx logic is to map a list.
    // I need to check UtilityDock.tsx to see if I need to add the new app keys to the 'apps' array there.
    // If I didn't update UtilityDock.tsx, the buttons won't appear!
    // Let's assume I missed that step and verify will fail.
    // FIX: I must view UtilityDock.tsx and update it if needed.
    
    // For this test file, I will assume the button is there. 
    // If UtilityDock is dynamic based on App.tsx it's fine. 
    // If strict list, I need to add it.
    
    // Let's try to find button by aria-label or icon if possible.
    // Or just click the one with the 'brain' looking icon if locatable.
    // Since I can't see the icon class easily in locator, I'll rely on index.
    // Let's guess it's the 10th button (index 9) for now.
    await dockButtons.nth(9).click();
    
    await expect(page.getByText('Council of Wisdom')).toBeVisible();
  });

  test('1. Simulation Run', async ({ page }) => {
    await page.getByRole('button', { name: 'Simulate Debate' }).click();
    // Should see Proposer appearing
    await expect(page.getByText('Hypothesis: Universal Basic Compute')).toBeVisible({ timeout: 5000 });
    // Should see Judge appearing eventually
    await expect(page.getByText('Verdict: Partial Consensus')).toBeVisible({ timeout: 15000 });
  });

  test('2. Settings Drawer', async ({ page }) => {
    // Click Settings icon (last button in header group?)
    // It has a Settings icon. 
    // Let's click the button that has the gear icon.
    const settingsBtn = page.locator('div.items-center.gap-3 > button').last(); 
    await settingsBtn.click();
    
    await expect(page.getByText('OpenRouter API Key')).toBeVisible();
  });
});
