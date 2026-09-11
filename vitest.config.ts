import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      thresholds: {
        // Mirrors the 70% target from STATEMENT.md §12 for services and pipes.
        perFile: true,
        '**/*.service.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        '**/*.pipe.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
});
