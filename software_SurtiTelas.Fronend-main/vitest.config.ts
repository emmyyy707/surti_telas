import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@presentation/components': path.resolve(__dirname, './src/presentation/components'),
      '@presentation/pages': path.resolve(__dirname, './src/presentation/pages'),
      '@presentation/contexts': path.resolve(__dirname, './src/presentation/contexts'),
      '@presentation/hooks': path.resolve(__dirname, './src/presentation/hooks'),
      '@presentation/styles': path.resolve(__dirname, './src/presentation/styles'),
      '@application': path.resolve(__dirname, './src/application'),
      '@application/services': path.resolve(__dirname, './src/application/services'),
      '@application/usecases': path.resolve(__dirname, './src/application/usecases'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@domain/entities': path.resolve(__dirname, './src/domain/entities'),
      '@domain/repositories': path.resolve(__dirname, './src/domain/repositories'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@infrastructure/api': path.resolve(__dirname, './src/infrastructure/api'),
      '@infrastructure/repositories': path.resolve(__dirname, './src/infrastructure/repositories'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@shared/ui': path.resolve(__dirname, './src/shared/ui'),
      '@shared/utils': path.resolve(__dirname, './src/shared/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/presentation/components/common'),
      '@modules': path.resolve(__dirname, './modules'),
      '@modules/admin': path.resolve(__dirname, './modules/admin'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
});
