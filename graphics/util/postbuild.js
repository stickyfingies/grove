import fs from 'fs';
import { exec } from 'child_process';

const path = './dist/index.es.js';

fs.readFile(path, 'utf8', (err, data) => {
    if (err) return console.error(err);

    // Vite spits out WebWorkers with absolute paths, making them nearly impossible
    // to package with reusable liraries.  This script applies a patch to the WW paths,
    // making them relative to the script that loads them.
    const result = data.replace(/Worker\("(.+)",/g, 'Worker(new URL(".$1", import.meta.url),');
    fs.writeFile('./dist/index.es.js', result, 'utf8', (err) => {
        if (err) console.error(err);
    });

    // I want to call "yalc publish" in a platform-independant way, which doesn't utterly
    // fail if yalc isn't installed on the host system.
    exec('yalc publish --push', (error, stdout, stderr) => {
        if (error) { /* yalc: command not found */ }
        if (stdout) console.log('\n\x1b[32m%s\x1b[0m', stdout);
        if (stderr) console.error('\n\x1b[31m%s\x1b[0m', stderr);
    });
});