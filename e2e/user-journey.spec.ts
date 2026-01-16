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

  test('should show Demo Mode button', async ({ page }) => {
    const demoButton = page.getByRole('button', { name: /demo mode/i });
    await expect(demoButton).toBeVisible();
  });

  test('should show feature descriptions', async ({ page }) => {
    // Check for feature descriptions in overlay
    await expect(page.locator('text=AI-Powered Research')).toBeVisible();
    await expect(page.locator('text=Real Web Validation')).toBeVisible();
  });

  test('should enter demo mode and show dashboard', async ({ page }) => {
    // Click demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);

    // Verify columns are visible
    await expect(page.locator('text=PROBLEMS').first()).toBeVisible();
    await expect(page.locator('text=SOLUTIONS').first()).toBeVisible();
  });

  test('should have steering slider in demo mode', async ({ page }) => {
    // Enter demo mode first
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);

    // Look for slider element
    const slider = page.locator('input[type="range"]').first();
    const sliderVisible = await slider.isVisible().catch(() => false);
    
    // Slider should exist in the UI
    expect(sliderVisible).toBe(true);
  });

  test('full user flow: initial load to demo mode', async ({ page }) => {
    // Step 1: Verify initial state - Welcome overlay visible
    await expect(page.locator('text=Welcome to Curatos DNA')).toBeVisible();
    await expect(page.getByRole('button', { name: /demo mode/i })).toBeVisible();
    
    // Step 2: Enter demo mode
    await page.getByRole('button', { name: /demo mode/i }).click();
    await page.waitForTimeout(1000);
    
    // Step 3: Verify demo mode active - columns should be visible
    await expect(page.locator('text=PROBLEMS').first()).toBeVisible();
    await expect(page.locator('text=SOLUTIONS').first()).toBeVisible();
    
    // Step 4: Verify DNA button is present
    const dnaButton = page.locator('button:has-text("DNA")');
    await expect(dnaButton.first()).toBeVisible();
  });
});
