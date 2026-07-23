import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: `${srcDir}/` }],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/server.ts', 'src/config/**'],
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 88,
        lines: 88,
      },
    },
  },
});
