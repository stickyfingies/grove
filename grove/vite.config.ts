/**
 * @see {@link ../SETTINGS.md}
 * 
 * Settings:
 * - 'build-output-location'
 */

import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

const settings = new Map<string, string>();

const README = readFileSync('../README.md', { encoding: 'utf8' });
const pattern = /\[(.*?)\]\((?:.*\/)?SETTINGS\.md#(.*?)\)/g;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
[...README.matchAll(pattern)]
  .reduce((list, [_, value, setting]) => list.set(setting, value), settings);

export default defineConfig({
  optimizeDeps: {
    exclude: ['firearm', '3-AD']
  },
  build: {
    emptyOutDir: true,
    outDir: settings.get('build-output-location') ?? '../app/build',
    target: 'esnext',
  },
});