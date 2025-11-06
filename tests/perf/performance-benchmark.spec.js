import { test, expect } from '@playwright/test';

/**
 * Performance Benchmark Tests
 * 
 * Tests performance targets:
 * - Desktop: 60fps (95th percentile frame-time < 16.7ms)
 * - Memory: < 500MB
 * - Load time: < 3 seconds
 * - No memory leaks over 5 minutes
 * 
 * Priority: P1 (High) - Performance is critical for competitive FPS
 */

test.describe('Performance Benchmarks - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('measures initial load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const domLoadTime = Date.now() - startTime;
    
    // Wait for game to be interactive
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    const totalLoadTime = Date.now() - startTime;
    
    console.log(`DOM Load Time: ${domLoadTime}ms`);
    console.log(`Total Load Time: ${totalLoadTime}ms`);
    
    // Should load within 3 seconds (desktop target)
    expect(domLoadTime).toBeLessThan(3000);
    expect(totalLoadTime).toBeLessThan(5000);
  });

  test('measures frame rate over 10 seconds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Measure FPS
    const fpsData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimes = [];
        const duration = 10000; // 10 seconds
        const startTime = performance.now();
        let lastFrameTime = startTime;
        
        function measureFrame(currentTime) {
          const frameTime = currentTime - lastFrameTime;
          frameTimes.push(frameTime);
          lastFrameTime = currentTime;
          
          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            // Calculate statistics
            frameTimes.sort((a, b) => a - b);
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const p95Index = Math.floor(frameTimes.length * 0.95);
            const p95FrameTime = frameTimes[p95Index];
            const minFrameTime = Math.min(...frameTimes);
            const maxFrameTime = Math.max(...frameTimes);
            
            resolve({
              avgFps: 1000 / avgFrameTime,
              avgFrameTime,
              p95FrameTime,
              p95Fps: 1000 / p95FrameTime,
              minFrameTime,
              maxFrameTime,
              totalFrames: frameTimes.length
            });
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });

    console.log('FPS Statistics:', fpsData);
    
    // Desktop target: 60fps avg, 95th percentile < 16.7ms
    expect(fpsData.avgFps).toBeGreaterThanOrEqual(45); // Allow some margin for CI
    expect(fpsData.p95FrameTime).toBeLessThan(25); // ~40fps minimum at p95
    
    // Log detailed stats
    console.log(`Average FPS: ${fpsData.avgFps.toFixed(2)}`);
    console.log(`95th Percentile Frame Time: ${fpsData.p95FrameTime.toFixed(2)}ms`);
    console.log(`Total Frames: ${fpsData.totalFrames}`);
  });

  test('measures memory usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const memoryStats = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
        };
      }
      return null;
    });

    if (memoryStats) {
      console.log('Memory Statistics:', memoryStats);
      
      // Desktop target: < 500MB
      const usedMB = parseFloat(memoryStats.usedMB);
      expect(usedMB).toBeLessThan(500);
      
      console.log(`Used Memory: ${memoryStats.usedMB}MB`);
      console.log(`Total Heap: ${memoryStats.totalMB}MB`);
    }
  });

  test('detects memory leaks over 5 minutes', async ({ page }) => {
    test.setTimeout(360000); // 6 minutes
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    console.log(`Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);

    // Let game run for 5 minutes
    const measurements = [];
    const duration = 5 * 60 * 1000; // 5 minutes
    const interval = 30 * 1000; // Measure every 30 seconds
    
    for (let elapsed = 0; elapsed < duration; elapsed += interval) {
      await page.waitForTimeout(interval);
      
      const currentMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      measurements.push({
        time: elapsed / 1000,
        memory: currentMemory,
        memoryMB: (currentMemory / 1024 / 1024).toFixed(2)
      });
      
      console.log(`${elapsed / 1000}s: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
    }

    // Final memory measurement
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    console.log(`Final Memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);

    if (initialMemory > 0 && finalMemory > 0) {
      const growthPercent = ((finalMemory - initialMemory) / initialMemory) * 100;
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;
      
      console.log(`Memory Growth: ${growthPercent.toFixed(2)}% (${growthMB.toFixed(2)}MB)`);
      
      // Memory should not grow by more than 30% over 5 minutes
      expect(growthPercent).toBeLessThan(30);
      
      // Absolute growth should be less than 200MB
      expect(growthMB).toBeLessThan(200);
    }
  });

  test('measures render time for complex scenes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Measure paint and render timing
    const paintMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        domInteractive: navigation.domInteractive,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    console.log('Paint Metrics:', paintMetrics);
    
    // First Contentful Paint should be under 1.5 seconds
    expect(paintMetrics.firstContentfulPaint).toBeLessThan(1500);
  });
});

test.describe('Performance Benchmarks - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('measures mobile load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Mobile Load Time: ${loadTime}ms`);
    
    // Mobile target: < 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('measures mobile frame rate', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Measure FPS over 5 seconds (shorter for mobile)
    const fpsData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimes = [];
        const duration = 5000;
        const startTime = performance.now();
        let lastFrameTime = startTime;
        
        function measureFrame(currentTime) {
          const frameTime = currentTime - lastFrameTime;
          frameTimes.push(frameTime);
          lastFrameTime = currentTime;
          
          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            frameTimes.sort((a, b) => a - b);
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const p95Index = Math.floor(frameTimes.length * 0.95);
            const p95FrameTime = frameTimes[p95Index];
            
            resolve({
              avgFps: 1000 / avgFrameTime,
              p95FrameTime,
              p95Fps: 1000 / p95FrameTime,
              totalFrames: frameTimes.length
            });
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });

    console.log('Mobile FPS Statistics:', fpsData);
    
    // Mobile target: 30fps avg
    expect(fpsData.avgFps).toBeGreaterThanOrEqual(25); // Allow margin
    expect(fpsData.p95FrameTime).toBeLessThan(50); // ~20fps minimum at p95
    
    console.log(`Mobile Average FPS: ${fpsData.avgFps.toFixed(2)}`);
  });

  test('measures mobile memory usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const memoryStats = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
        };
      }
      return null;
    });

    if (memoryStats) {
      console.log(`Mobile Memory Usage: ${memoryStats.usedMB}MB`);
      
      // Mobile target: < 300MB
      const usedMB = parseFloat(memoryStats.usedMB);
      expect(usedMB).toBeLessThan(300);
    }
  });
});

test.describe('Network Performance', () => {
  test('measures resource loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      const scripts = resources.filter(r => r.initiatorType === 'script');
      const stylesheets = resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css');
      const images = resources.filter(r => r.initiatorType === 'img');
      
      return {
        totalResources: resources.length,
        scripts: scripts.length,
        stylesheets: stylesheets.length,
        images: images.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        totalDuration: resources.reduce((sum, r) => sum + r.duration, 0)
      };
    });

    console.log('Resource Metrics:', resourceMetrics);
    console.log(`Total Resources: ${resourceMetrics.totalResources}`);
    console.log(`Total Size: ${(resourceMetrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Total transfer size should be reasonable
    expect(resourceMetrics.totalSize).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
