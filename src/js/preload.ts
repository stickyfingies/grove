import { contextBridge } from 'electron';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const talib = require('../../build/Release/shmnode.node');

console.log(talib.hello());

const buffer = new SharedArrayBuffer(4);
const view = new Float32Array(buffer);

view[0] = 9.0;

// setInterval(() => console.log(view[0]), 1_000);

contextBridge.exposeInMainWorld('foo', (t: number) => { view[0] = t; });
