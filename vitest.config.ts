import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      exclude: ['bin/', 'dist/', '*.cjs', 'test/', 'test-d/'],

      // Require 100% test coverage
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100,
      },
    },
  },
});
