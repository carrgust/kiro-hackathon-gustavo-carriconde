import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('initial Welcome overlay screen', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to settle
    await page.waitForTimeout(1000);
    
    // Verify Welcome overlay is visible
    await expect(page.locator('text=Welcome to Curatos DNA')).toBeVisible();
    
    // Take screenshot of initial state
    await expect(page).toHaveScreenshot('welcome-overlay.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    });
  });
});
