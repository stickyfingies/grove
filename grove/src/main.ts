import './style.css';
import { Engine } from '@grove/engine';

/**
 * Note to future Seth:  I'm really pissed that I didn't blog about this coding journey.
 * The Grove has been single-handedly my deepest dive into coding a large project from scratch,
 * it has taught me so much, and I think there was a lot of invaluable wisdom gained from working
 * on this.
 *
 * I recall from memory *so* many thought processes and development decisions that could've been
 * written about, and it's a shame that I didn't do so.  My best wish now is to continue work on
 * The Grove, and document _everything_ on my way.
 *
 * Buddha shine upon these TypeScript files.
 */

/**
 * UPDATE 8/12/2021
 * ================
 * Big fat ole TODO: re-implement https://github.com/hybridalpaca/grove-revamped
 * using the modern Grove engine!!  I'm SO down!
 */

/**
 * TODO 9/2/2021
 * =============
 * [X] Delete physics bodies
 * [ ] Procedural terrain
 */

const engine = new Engine();

document.addEventListener('DOMContentLoaded', async () => {
    await engine.init();

    // @ts-ignore - TSC and Vite aren't playing nice still
    const modules: Record<string, Function> = import.meta.glob('./game/**/*.ts');
    const module_promises = Object
        .entries(modules)
        .map(([path, loadModule]) => loadModule().then((module: NodeModule) => {
            const filename = path.split('/').pop();
            const name = filename?.split('.')[0]!;
            return { name, module };
        }));

    const game_modules = (await Promise.all(module_promises))
        .filter(({ module }) => 'default' in module)

    engine.attachModules(game_modules);
});
