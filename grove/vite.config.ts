import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['firearm', '3-AD']
  },
  build: {
    emptyOutDir: true,
    outDir: '../app/build',
    target: 'esnext',
  },
});