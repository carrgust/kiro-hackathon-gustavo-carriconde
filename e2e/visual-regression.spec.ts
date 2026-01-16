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

  test('dashboard with demo mode active', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Activate demo mode from overlay
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify columns are visible
    await expect(page.locator('text=PROBLEMS').first()).toBeVisible();
    
    // Take screenshot with demo data
    await expect(page).toHaveScreenshot('dashboard-demo-mode.png', {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });

  test('problems column visible in demo mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Activate demo mode from overlay
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify problems column is visible
    const problemsColumn = page.locator('text=PROBLEMS').first();
    await expect(problemsColumn).toBeVisible();
    
    // Take screenshot
    await expect(page).toHaveScreenshot('problems-column.png', {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });

  test('solutions column visible in demo mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Activate demo mode from overlay
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify solutions column is visible
    const solutionsColumn = page.locator('text=SOLUTIONS').first();
    await expect(solutionsColumn).toBeVisible();
    
    // Take screenshot
    await expect(page).toHaveScreenshot('solutions-column.png', {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });

  test('DNA button visible in demo mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Activate demo mode from overlay
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify DNA button is visible
    const dnaButton = page.locator('button:has-text("DNA")');
    await expect(dnaButton.first()).toBeVisible();
    
    // Take screenshot
    await expect(page).toHaveScreenshot('dna-button.png', {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });
});
