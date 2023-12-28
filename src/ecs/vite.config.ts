import { name } from "./package.json";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';
import path from "path";

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: format => `index.${format}.js`,
            name
        },
        outDir: "./lib",
    },
    plugins: [dts()]
});