import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: '../app/editor',
    target: 'esnext',
  },
});