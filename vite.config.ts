import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : './',
  build: {
    emptyOutDir: true,
    outDir: 'app/build',
  },
});