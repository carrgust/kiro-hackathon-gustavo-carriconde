import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure WelcomeOverlay shows
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should show Welcome overlay on initial load', async ({ page }) => {
    // Check for Welcome heading in overlay
    await expect(page.locator('text=Welcome to Curatos DNA')).toBeVisible();
  });

  test('should show Demo Mode button in overlay', async ({ page }) => {
    const demoButton = page.getByRole('button', { name: /demo mode/i });
    await expect(demoButton).toBeVisible();
  });

  test('should load demo mode when clicking Demo Mode button', async ({ page }) => {
    // Find and click the demo button in overlay
    const demoButton = page.getByRole('button', { name: /demo mode/i });
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Wait for demo mode to activate - columns should appear
    await page.waitForTimeout(1000);
    
    // In demo mode, the columns should be visible
    const problemsColumn = page.locator('text=PROBLEMS').first();
    await expect(problemsColumn).toBeVisible({ timeout: 10000 });
  });

  test('should show problems column in demo mode', async ({ page }) => {
    // Activate demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);

    // Check problems column exists
    const problemsColumn = page.locator('text=PROBLEMS').first();
    await expect(problemsColumn).toBeVisible();
  });

  test('should show solutions column in demo mode', async ({ page }) => {
    // Activate demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);

    // Check solutions column exists
    const solutionsColumn = page.locator('text=SOLUTIONS').first();
    await expect(solutionsColumn).toBeVisible();
  });

  test('should show DNA button in demo mode', async ({ page }) => {
    // Activate demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);

    // Look for DNA button (may be disabled initially)
    const dnaButton = page.locator('button:has-text("DNA")');
    
    // DNA button should be visible (even if disabled)
    await expect(dnaButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should not show API errors in demo mode', async ({ page }) => {
    // Activate demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);

    // Check no error toasts are visible
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    const hasError = await errorToast.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
