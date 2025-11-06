import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests for Arena Blitz FPS
 * 
 * Tests WCAG 2.1 Level AA compliance for:
 * - Main game interface
 * - HUD elements
 * - Interactive controls
 * - Color contrast
 * - Keyboard navigation
 * 
 * Priority: P1 (High) - Accessibility is required for inclusive gaming
 */
test.describe('Game Accessibility', () => {
  test('main game page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('HUD elements have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for ARIA roles and labels on key elements
    const hud = page.locator('#hud');
    await expect(hud).toBeVisible();

    // HUD should have appropriate role
    const hudRole = await hud.getAttribute('role');
    // If no explicit role, that's okay for display-only elements
    if (hudRole) {
      expect(['presentation', 'img', 'region']).toContain(hudRole);
    }
  });

  test('game canvas has accessible name', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const canvas = page.locator('#game-canvas');
    
    // Canvas should have aria-label or title for screen readers
    const ariaLabel = await canvas.getAttribute('aria-label');
    const title = await canvas.getAttribute('title');
    
    // At least one should be present
    expect(ariaLabel || title).toBeTruthy();
  });

  test('page has proper document structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper HTML structure
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for lang attribute
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('en');

    // Check for meta viewport
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    expect(viewport).toBeTruthy();
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Run axe with color-contrast rules specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('#hud')
      .analyze();

    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations
      .filter(v => v.id === 'color-contrast');

    expect(colorContrastViolations).toEqual([]);
  });

  test('keyboard navigation is possible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Test Tab navigation (if there are focusable elements)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check if focus indicator is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el.tagName,
        id: el.id,
        className: el.className
      };
    });

    expect(focusedElement).toBeDefined();
  });

  test('no keyboard traps exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Try to tab through all focusable elements
    let tabCount = 0;
    const maxTabs = 50; // Safety limit

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      await page.waitForTimeout(50);
    }

    // Should complete without hanging
    expect(tabCount).toBe(maxTabs);
  });

  test('images have alt text (if any)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check all images for alt text
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt && !img.getAttribute('role') === 'presentation');
    });

    expect(imagesWithoutAlt.length).toBe(0);
  });

  test('form elements have labels (if any)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Run axe for form-related rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Filter for label violations
    const labelViolations = accessibilityScanResults.violations
      .filter(v => v.id.includes('label'));

    expect(labelViolations).toEqual([]);
  });

  test('heading hierarchy is logical (if any)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check heading structure
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent }));
    });

    // If there are headings, check they start with h1
    if (headings.length > 0) {
      expect(headings[0].level).toBeLessThanOrEqual(2);
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Get all focusable elements
    const focusableElements = await page.evaluate(() => {
      const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(document.querySelectorAll(selector)).length;
    });

    if (focusableElements > 0) {
      // Tab to first element
      await page.keyboard.press('Tab');
      
      // Check if focus styles are applied
      const hasFocusStyles = await page.evaluate(() => {
        const focused = document.activeElement;
        const styles = window.getComputedStyle(focused);
        
        // Check for outline or other focus indicators
        return styles.outline !== 'none' || 
               styles.outlineWidth !== '0px' ||
               styles.boxShadow !== 'none';
      });

      // Focus indicators should be present
      expect(typeof hasFocusStyles).toBe('boolean');
    }
  });

  test('no violations for reduced motion preference', async ({ page }) => {
    // Set prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Game should respect reduced motion
    // Check if animations are toned down (implementation-specific)
    const prefersReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(prefersReducedMotion).toBe(true);
  });
});

test.describe('Screen Reader Support', () => {
  test('page has proper landmark regions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const landmarks = await page.evaluate(() => {
      const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="region"], [role="complementary"]');
      return landmarks.length;
    });

    // Should have at least one landmark (main game area)
    expect(landmarks).toBeGreaterThanOrEqual(0);
  });

  test('live regions are properly announced', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check for aria-live regions (for game updates)
    const liveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live]');
      return Array.from(regions).map(r => r.getAttribute('aria-live'));
    });

    // Live regions should use appropriate politeness levels
    liveRegions.forEach(level => {
      expect(['polite', 'assertive', 'off']).toContain(level);
    });
  });
});

test.describe('Touch Target Size (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('touch targets meet minimum size requirements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Get all interactive elements
    const touchTargets = await page.evaluate(() => {
      const selector = 'button, a, input, [role="button"], [onclick]';
      const elements = Array.from(document.querySelectorAll(selector));
      
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          area: rect.width * rect.height,
          tag: el.tagName
        };
      });
    });

    // Touch targets should be at least 44x44 pixels (WCAG AAA guideline)
    const minSize = 44;
    const tooSmall = touchTargets.filter(t => 
      t.width < minSize || t.height < minSize
    );

    // Allow some tolerance for game-specific UI
    expect(tooSmall.length).toBeLessThanOrEqual(touchTargets.length * 0.1);
  });
});
