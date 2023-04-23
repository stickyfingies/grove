import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: '../app/build',
    target: 'esnext',
  },
});