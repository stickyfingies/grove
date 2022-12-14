import { name } from "./package.json";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';
import path from "path";

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: format => `index.${format}.js`,
      name
    },
    rollupOptions: {
      external: ['three', '@grove/physics', '@grove/graphics'],
    },
    outDir: "./lib",
  },
  plugins: [dts()]
});