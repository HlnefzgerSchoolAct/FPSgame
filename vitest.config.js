import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.spec.js',
        '**/*.test.js',
        'tests/**',
        'vite.config.js',
        'vitest.config.js',
        'playwright.config.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    include: ['tests/unit/**/*.spec.js', 'tests/integration/**/*.spec.js'],
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
