# firearm

Library: Run Ammo.js physics in a parallel worker thread

### Using with Vite

If you're consuming this library with a project that uses Vite, you must
disable dependency optimization for Firearm.  That's because `index.es.js`,
which is the main library file, needs to be able to find `physicsworker.hash.js`,
the worker file - and this cannot happen inside Vite's cache dir.

Your `vite.config.ts` file should look like this:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
    // ...
    optimizeDeps: {
        exclude: ['firearm']
    },
    // ...
});
```