import './style.css';
import { Engine, GameSystem } from '@grove/engine';

type ScriptInfo = {
    language: 'TypeScript' | 'WebAssembly',
    glob: Record<string, () => Promise<NodeModule>>
};

const CONFIG: ReadonlyArray<ScriptInfo> = [{
    language: 'WebAssembly',
    glob: import.meta.glob('./game/**/*.js')
}, {
    language: 'TypeScript',
    glob: import.meta.glob('./game/*.ts')
}];

//////////////////////
/// IMPLEMENTATION ///
//////////////////////

async function loadGameScripts({ language, glob }: ScriptInfo) {

    // **Import Code**
    // { filepath->fn() } -> { filepath->module }
    const modules = (await Promise.all(Object
        .entries(glob)
        .map(([path, loadModule]) => loadModule().then((module: NodeModule) => {
            const filepath = path.split('/').pop();
            const filename = filepath?.split('.')[0]!;
            return { filename, module } as const;
        }))))
        .filter(({ module }) => 'default' in module);

    // **Logging**
    console.groupCollapsed(`loadGameScripts() - ${language}`);
    modules
        .map(({ filename, module }) => filename + ' - ' + Object.keys(module).join(', '))
        .forEach(s => console.log(s));
    console.groupEnd();

    // **TypeScript files**
    // Assumes 'export default class extends GameScript'
    if (language === 'TypeScript') {
        return modules.map(({ module }) => new (module as any).default() as GameSystem);
    }
    // **WebAssembly files**
    // Assumes 'export default function `init_wasm_module() => void`'
    else if (language === 'WebAssembly') {
        return Promise.all(modules.map(({ module }) => (module as any).default() as GameSystem));
    }

    return 0 as never;

}

async function main() {

    const scripts_please = CONFIG.map(loadGameScripts);

    const engine = new Engine();
    await engine.init();

    (await Promise.all(scripts_please))
        .forEach(engine.attachModules);

}

if (document.readyState !== 'loading') { main(); }
else { document.addEventListener('DOMContentLoaded', main); }
