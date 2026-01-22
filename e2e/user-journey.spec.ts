import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure WelcomeOverlay shows
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display Welcome overlay on initial load', async ({ page }) => {
    // Check for Welcome heading in overlay
    await expect(page.locator('text=Welcome to Curatos DNA')).toBeVisible();
  });

  test('should show Enter Live Mode button', async ({ page }) => {
    // Look for Live Mode button in overlay
    const liveButton = page.getByRole('button', { name: /enter live mode/i });
    await expect(liveButton).toBeVisible();
  });

  test('should show feature descriptions', async ({ page }) => {
    // Check for feature descriptions in overlay
    await expect(page.locator('text=AI-Powered Research')).toBeVisible();
    await expect(page.locator('text=Real Web Validation')).toBeVisible();
  });
});
