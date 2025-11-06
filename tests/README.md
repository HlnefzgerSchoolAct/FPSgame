# Arena Blitz FPS - Test Suite

This directory contains the comprehensive test suite for Arena Blitz FPS, including unit tests, integration tests, E2E tests, accessibility tests, and performance benchmarks.

## Directory Structure

```
tests/
├── unit/                  # Unit tests for isolated modules
│   ├── gameplay/         # Gameplay system tests
│   ├── weapons/          # Weapon system tests
│   ├── mechanics/        # Game mechanics tests
│   └── networking/       # Networking tests
├── integration/          # Integration tests for system interactions
│   ├── systems/          # Multi-system integration tests
│   └── flows/            # User flow integration tests
├── e2e/                  # End-to-end Playwright tests
├── a11y/                 # Accessibility tests
├── perf/                 # Performance benchmarks
├── test-plan.md          # Comprehensive test plan
└── README.md             # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests
```bash
# Run once
npm run test:unit

# Watch mode (re-runs on file changes)
npm run test:unit:watch

# With coverage report
npm run test:unit:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

### Accessibility Tests
```bash
npm run test:a11y
```

### Performance Tests
```bash
npm run test:perf
```

## Test Frameworks

### Unit & Integration Tests: Vitest
- Fast, Jest-compatible test runner
- Built-in code coverage with V8
- ESM support out of the box
- Configuration: `vitest.config.js`

### E2E Tests: Playwright
- Cross-browser testing (Chromium, Firefox, WebKit)
- Automatic waiting and retries
- Screenshots and videos on failure
- Trace viewer for debugging
- Configuration: `playwright.config.js`

### Accessibility: axe-core
- WCAG 2.1 Level AA compliance checking
- Integrated with Playwright tests
- Automated violation detection

## Writing Tests

### Unit Test Example

```javascript
// tests/unit/gameplay/HealthSystem.spec.js
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthSystem } from '../../../src/gameplay/HealthSystem.js';

describe('HealthSystem', () => {
  let healthSystem;

  beforeEach(() => {
    healthSystem = new HealthSystem(100);
  });

  it('should reduce health on damage', () => {
    healthSystem.takeDamage(30);
    expect(healthSystem.currentHealth).toBe(70);
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/match-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete match flow', async ({ page }) => {
  await page.goto('/');
  
  // Join match
  await page.click('#join-match');
  await expect(page.locator('#match-started')).toBeVisible();
  
  // Verify gameplay elements
  const canvas = page.locator('#game-canvas');
  await expect(canvas).toBeVisible();
});
```

### Accessibility Test Example

```javascript
// tests/a11y/menu-navigation.spec.js
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('menu is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  
  await checkA11y(page, '#main-menu', {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

## Test Coverage Goals

### Priority Modules (Target: 80%+ coverage)
- ✅ `src/gameplay/` - Core gameplay systems
- ✅ `src/weapons/` - Weapon mechanics
- ⏳ `src/mechanics/` - Movement and physics
- ⏳ `src/networking/` - Client-side networking
- ⏳ `server/` - Server-side logic

### Coverage Reports
- HTML Report: `coverage/index.html`
- Console: View during `npm run test:unit:coverage`
- CI: Uploaded as artifacts on each PR

## Performance Budgets

### Desktop Targets
- **Frame Rate**: 60fps (95th percentile)
- **Frame Time**: < 16.7ms
- **Memory**: < 500MB
- **Initial Load**: < 3 seconds

### Mobile Targets
- **Frame Rate**: 30fps (95th percentile)
- **Frame Time**: < 33.3ms
- **Memory**: < 300MB
- **Initial Load**: < 5 seconds

### Network Targets
- **Bandwidth (combat)**: < 100 kbps
- **Latency tolerance**: Playable up to 200ms RTT

## CI/CD Integration

Tests run automatically on:
- Every push to `main`, `develop`, or `copilot/**` branches
- Every pull request
- Nightly builds (full test suite)

### Workflow: `.github/workflows/test.yml`
- Unit tests with coverage
- E2E tests with screenshots/videos on failure
- Build verification
- Security audit

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npx vitest run tests/unit/gameplay/HealthSystem.spec.js

# Run tests matching pattern
npx vitest run -t "should reduce health"

# Debug with Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### E2E Tests
```bash
# Debug specific test
npx playwright test tests/e2e/match-flow.spec.js --debug

# Run with UI mode
npx playwright test --ui

# View trace
npx playwright show-trace trace.zip
```

## Test Data

### Mock Data
- Located in `tests/__mocks__/`
- Simulates API responses, game state, player data
- Use `vi.mock()` to replace real modules

### Fixtures
- Playwright fixtures in `tests/e2e/fixtures.js`
- Reusable test data and setup logic
- Page object models for common interactions

## Flaky Tests

### Prevention
- Use Playwright's auto-waiting
- Avoid hardcoded timeouts
- Use `waitFor` conditions instead of `sleep`
- Isolate tests (no shared state)

### Debugging
- Check test video/screenshot artifacts
- Review trace viewer
- Increase timeout temporarily: `test.setTimeout(60000)`

## Accessibility Standards

We test against **WCAG 2.1 Level AA** standards:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast (4.5:1 for normal text)
- ✅ Focus indicators
- ✅ ARIA labels and roles
- ✅ Touch target size (≥44px)

### Common Violations
- Missing `alt` text on images
- Insufficient color contrast
- Missing ARIA labels on interactive elements
- Keyboard traps
- Focus management issues

## Performance Testing

### FPS Monitoring
```javascript
// tests/perf/match-benchmark.spec.js
test('maintains 60fps during combat', async ({ page }) => {
  await page.goto('/');
  
  const fps = await page.evaluate(() => {
    return new Promise(resolve => {
      let frames = 0;
      let lastTime = performance.now();
      
      function countFrames() {
        frames++;
        if (performance.now() - lastTime > 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(countFrames);
        }
      }
      
      requestAnimationFrame(countFrames);
    });
  });
  
  expect(fps).toBeGreaterThanOrEqual(55); // Allow 5fps margin
});
```

### Memory Leak Detection
```javascript
test('no memory leaks in 10 minute session', async ({ page }) => {
  await page.goto('/');
  
  const initialMemory = await page.evaluate(() => {
    return performance.memory.usedJSHeapSize;
  });
  
  // Play for 10 minutes (simulated)
  await page.waitForTimeout(600000);
  
  const finalMemory = await page.evaluate(() => {
    return performance.memory.usedJSHeapSize;
  });
  
  const growth = (finalMemory - initialMemory) / initialMemory;
  expect(growth).toBeLessThan(0.2); // Less than 20% growth
});
```

## Resources

- [Test Plan](./test-plan.md) - Comprehensive testing strategy
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Contributing

When adding new features:
1. ✅ Write unit tests first (TDD)
2. ✅ Ensure tests pass locally
3. ✅ Maintain or improve coverage
4. ✅ Add E2E tests for user flows
5. ✅ Check accessibility with axe-core
6. ✅ Run performance benchmarks if relevant

## Questions?

Contact the QA team:
- QA Lead: [Name]
- Slack: #qa-testing
- Issues: [GitHub Issues](https://github.com/HlnefzgerSchoolAct/FPSgame/issues)
