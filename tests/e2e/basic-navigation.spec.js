import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the game page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check for canvas element
    const canvas = await page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have valid page title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Arena Blitz|FPS/i);
  });

  test('should load main HTML without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Allow some expected errors but check for critical ones
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to fetch') && // Network errors during dev are acceptable
      !err.includes('WebSocket')  // WebSocket errors during page load are acceptable
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Game Initialization', () => {
  test('should initialize Three.js renderer', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    // Check if Three.js WebGL context was created
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
    
    expect(hasWebGL).toBe(true);
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const canvas = await page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    
    // Resize window
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Canvas should still be visible
    await expect(canvas).toBeVisible();
  });
});
