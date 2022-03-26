import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : './',
  build: {
    emptyOutDir: true,
    outDir: 'app/build',
  },
});