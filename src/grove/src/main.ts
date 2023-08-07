import './style.css';

import { Engine } from '@grove/engine';

async function main() {

    const engine = new Engine();
    await engine.init();
    await engine.run_scripts({
        typescript: [
            import.meta.glob('./game/*.ts')
        ],
        webassembly: [
            import.meta.glob('./game/**.*.js')
        ]
    });

}

if (document.readyState !== 'loading') { await main(); }
else { document.addEventListener('DOMContentLoaded', main); }
