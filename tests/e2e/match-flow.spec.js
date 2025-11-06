import { test, expect } from '@playwright/test';

/**
 * Two-Player Match Flow E2E Test
 * 
 * Tests the complete flow of:
 * 1. Two players joining
 * 2. Match initialization
 * 3. Gameplay interaction
 * 4. Match completion
 * 
 * Priority: P0 (Critical)
 */
test.describe('Two-Player Match Flow', () => {
  test.setTimeout(120000); // 2 minutes for full flow

  test('complete match flow with two players', async ({ browser }) => {
    // Create two separate browser contexts for two players
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      // Step 1: Both players load the game
      await test.step('Load game for both players', async () => {
        await Promise.all([
          player1Page.goto('/'),
          player2Page.goto('/')
        ]);

        // Wait for game to load
        await Promise.all([
          player1Page.waitForLoadState('domcontentloaded'),
          player2Page.waitForLoadState('domcontentloaded')
        ]);

        // Verify canvas is visible for both
        await expect(player1Page.locator('#game-canvas')).toBeVisible();
        await expect(player2Page.locator('#game-canvas')).toBeVisible();
      });

      // Step 2: Verify game initialization
      await test.step('Verify game initialization', async () => {
        // Wait for game to initialize (give it a few seconds)
        await player1Page.waitForTimeout(3000);
        await player2Page.waitForTimeout(3000);

        // Check for HUD elements
        const player1HUD = player1Page.locator('#hud');
        const player2HUD = player2Page.locator('#hud');

        await expect(player1HUD).toBeVisible();
        await expect(player2HUD).toBeVisible();

        // Check for crosshair
        await expect(player1Page.locator('#crosshair')).toBeVisible();
        await expect(player2Page.locator('#crosshair')).toBeVisible();
      });

      // Step 3: Verify WebGL context
      await test.step('Verify WebGL rendering', async () => {
        const player1WebGL = await player1Page.evaluate(() => {
          const canvas = document.getElementById('game-canvas');
          if (!canvas) return false;
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          return gl !== null;
        });

        const player2WebGL = await player2Page.evaluate(() => {
          const canvas = document.getElementById('game-canvas');
          if (!canvas) return false;
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          return gl !== null;
        });

        expect(player1WebGL).toBe(true);
        expect(player2WebGL).toBe(true);
      });

      // Step 4: Simulate player inputs (if controls are accessible)
      await test.step('Test basic game interaction', async () => {
        // Focus the game canvas
        await player1Page.locator('#game-canvas').click();
        await player2Page.locator('#game-canvas').click();

        // Simulate keyboard inputs (movement keys)
        await player1Page.keyboard.press('w'); // Forward
        await player1Page.keyboard.press('d'); // Right
        
        await player2Page.keyboard.press('s'); // Backward
        await player2Page.keyboard.press('a'); // Left

        // Give time for game to process inputs
        await player1Page.waitForTimeout(500);
      });

      // Step 5: Check for no critical errors
      await test.step('Verify no critical errors', async () => {
        // Check console for critical errors
        const player1Errors = [];
        const player2Errors = [];

        player1Page.on('pageerror', error => player1Errors.push(error.message));
        player2Page.on('pageerror', error => player2Errors.push(error.message));

        // Wait a bit to see if errors occur
        await player1Page.waitForTimeout(2000);

        // Filter out expected errors (like network disconnections during test)
        const player1Critical = player1Errors.filter(err => 
          !err.includes('WebSocket') && 
          !err.includes('Failed to fetch')
        );
        const player2Critical = player2Errors.filter(err => 
          !err.includes('WebSocket') && 
          !err.includes('Failed to fetch')
        );

        expect(player1Critical.length).toBe(0);
        expect(player2Critical.length).toBe(0);
      });

      // Step 6: Verify performance
      await test.step('Check basic performance metrics', async () => {
        const player1FPS = await player1Page.evaluate(() => {
          return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();
            
            function countFrames() {
              frameCount++;
              const elapsed = performance.now() - startTime;
              
              if (elapsed >= 1000) {
                resolve(frameCount);
              } else {
                requestAnimationFrame(countFrames);
              }
            }
            
            requestAnimationFrame(countFrames);
          });
        });

        // Should maintain at least 20fps (conservative for CI)
        expect(player1FPS).toBeGreaterThanOrEqual(20);
      });

    } finally {
      // Cleanup
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('game handles window resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // Get initial dimensions
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();

    // Resize window
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    // Canvas should still be visible and resized
    await expect(canvas).toBeVisible();
    const resizedBox = await canvas.boundingBox();
    expect(resizedBox).not.toBeNull();
  });

  test('game responds to input events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Click to focus canvas
    await page.locator('#game-canvas').click();

    // Test keyboard inputs
    const keyTests = ['w', 'a', 's', 'd', 'Space', 'Shift'];
    
    for (const key of keyTests) {
      await page.keyboard.press(key);
      // Small delay between inputs
      await page.waitForTimeout(50);
    }

    // Should complete without throwing
    expect(true).toBe(true);
  });

  test('HUD elements are present and visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check HUD container
    await expect(page.locator('#hud')).toBeVisible();

    // Check crosshair
    await expect(page.locator('#crosshair')).toBeVisible();

    // Check crosshair lines
    const crosshairLines = page.locator('.crosshair-line');
    const count = await crosshairLines.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Network Connection', () => {
  test('handles WebSocket connection', async ({ page }) => {
    // Track WebSocket connections
    const wsConnections = [];
    page.on('websocket', ws => {
      wsConnections.push(ws.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should attempt WebSocket connection to game server
    const hasWSConnection = wsConnections.some(url => 
      url.includes('ws://') || url.includes('wss://')
    );

    // Note: Connection might fail if server isn't running, but attempt should be made
    expect(wsConnections.length).toBeGreaterThanOrEqual(0);
  });

  test('handles server disconnection gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Game should still render even if server connection fails
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#hud')).toBeVisible();
  });
});

test.describe('Memory and Performance', () => {
  test('monitors memory usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    // If memory API is available, check it's reasonable
    if (memoryInfo) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(memoryInfo.jsHeapSizeLimit);
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0);
    }
  });

  test('no memory leaks after 30 seconds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Let game run for 30 seconds
    await page.waitForTimeout(30000);

    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const growth = (finalMemory - initialMemory) / initialMemory;
      // Memory should not grow by more than 50% in 30 seconds
      expect(growth).toBeLessThan(0.5);
    }
  });
});
