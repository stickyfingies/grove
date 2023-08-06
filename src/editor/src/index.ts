import cytoscape, { CytoscapeOptions } from 'cytoscape';
import cola from 'cytoscape-cola';
import domnode from 'cytoscape-dom-node';
import expandcollapse from 'cytoscape-expand-collapse';

// Keep this at the top
window.onerror = (e) => {
    const error_box = document.createElement('pre');
    error_box.className = 'error';
    error_box.innerHTML = JSON.stringify(e, undefined, 4);
    document.body.prepend(error_box);
};

const GRAPH_UI_WIDTH = 0;
const GRAPH_UI_HEIGHT = 0;

// <data>
const ELEMENTS = [
    { id: 'backend', label: 'Graphics Backend' },
    { id: 'frontend', label: 'Graphics Frontend' },
    { id: 'gpu', img: 'gpu.png', label: 'Video Card' },
    { parent: 'backend', id: 'decoder', label: 'Decoder' },
    { parent: 'backend', id: 'texturecache', label: 'Texture Cache', html: 'texturecache' },
    { parent: 'backend', id: 'renderer', label: 'Renderer', img: 'webgl.png' },
    { parent: 'backend', id: 'backendscene', html: 'linearscene', label: 'Scene' },
    { source: 'decoder', target: 'backendscene', label: 'Builds' },
    { source: 'decoder', target: 'texturecache' },
    { source: 'frontend', target: 'decoder' },
    { source: 'renderer', target: 'gpu' },
    { source: 'renderer', target: 'backendscene', label: 'Renders' },
];

const options: CytoscapeOptions = {
    container: document.getElementById('cy'),
    wheelSensitivity: 0.1,
    // elements,
    style: [
        {
            selector: 'node',
            style: { width: '200', height: '200' }
        },
        {
            selector: '[label]',
            style: {
                'label': 'data(label)',
                'text-valign': 'top',
                'text-halign': 'right',
                'font-family': 'Chewy',
                'text-rotation': '30deg',
                "text-wrap": "wrap",
                "text-max-width": 120,
                'font-size': '66%'
            }
        },
        {
            selector: '$[label] > node',
            style: {
                'background-opacity': 0,
                "border-opacity": 0,
                'label': ''
            }
        },
        {
            selector: '[img]',
            style: {
                'background-opacity': 1,
                'padding': '50px',
                'border-radius': '50px',
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 12,
                'source-arrow-shape': 'none',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'arrow-scale': 3
            }
        },
        {
            selector: 'edge[label]',
            style: {
                'text-background-padding': '5px',
                'text-background-color': '#eee',
                'text-background-opacity': 1,
                'text-border-color': 'black',
                'text-border-opacity': 1,
                'text-border-width': 3
            }
        }
    ],
};

function layoutGenerate(cy: cytoscape.Core) {
    const horizontal = [];
    const vertical = [];
    const gapInequalities = [];
    gapInequalities.push({
        axis: 'y',
        left: cy.$id('backend'),
        right: cy.$id('gpu'),
        gap: 500,
        equality: true
    }, {
        axis: 'y',
        left: cy.$id('frontend'),
        right: cy.$id('backend'),
        gap: 1500,
        equality: true
    });
    if (cy.$id('backendscene').length) {
        horizontal.push([
            { node: cy.$id('renderer'), offset: 0 },
            { node: cy.$id('backendscene'), offset: 0 }
        ]);
        vertical.push([
            { node: cy.$id('renderer'), offset: 0 },
            { node: cy.$id('gpu'), offset: 0 },
        ]);
    }
    vertical.push([
        { node: cy.$id('backend'), offset: 0 },
        { node: cy.$id('gpu'), offset: 0 },
    ]);
    return {
        name: "cola",
        animate: true,
        randomize: true,
        fit: true,
        infinite: false,
        nodeSpacing() { return 300; },
        alignment: {
            horizontal,
            vertical
        },
        gapInequalities
    };
}

let layout: cytoscape.Layouts | null = null;

function DynamicLayout({ cy }: { cy: cytoscape.Core }) {
    if (layout) layout.stop();
    layout = cy.layout(layoutGenerate(cy));
}

DynamicLayout.prototype.run = () => layout!.run();

function registerDynamicLayout(cytoscape) {
    cytoscape('layout', 'dynamic', DynamicLayout);
}

// Plugins and initialization
cytoscape.use(cola);
cytoscape.use(domnode);
cytoscape.use(expandcollapse);
cytoscape.use(registerDynamicLayout);
const cy = cytoscape(options);
// @ts-ignore - Too lazy to extend `Window` interface
window.cy = cy;
// @ts-ignore - JavaScript from Hell
cy.domNode();
// @ts-ignore - JavaScript from Hell
cy.expandCollapse({
    fisheye: true,
    undoable: false,
    layoutBy: { name: 'dynamic' }
});
// @ts-ignore
const collapse = window.collapse = cy.expandCollapse('get');

ELEMENTS
    // (1) wrap { data }
    .map((data) => { return { data } })
    // (2) add html
    .map(function attachHTML(element) {
        if ('img' in element.data) {
            const img = document.createElement('img');
            img.src = `/icons/${element.data.img!}`;
            Object.assign(element.data, { dom: img });
        }
        else if ('html' in element.data) {
            const template = document.getElementById(element.data.html!) as HTMLTemplateElement;
            const dom = template.content.firstElementChild!.cloneNode(true);
            Object.assign(element.data, { dom });
        }
        return element;
    })
    // (3) attach element to graph
    .forEach((ele) => {
        cy.add(ele);
    });

cy.on("expandcollapse.beforecollapse", (event) => {
    const target = event.target;
    target.descendants('[html]').forEach((ele) => ele.data('dom').remove());
    target.descendants('[img]').data('dom').remove();
});

collapse.collapseAll();

function resize() {
    const graph_ui_width = GRAPH_UI_WIDTH || window.innerWidth;
    const graph_ui_height = GRAPH_UI_HEIGHT || window.innerHeight;
    cy.container()!.style.width = `${graph_ui_width}px`;
    cy.container()!.style.height = `${graph_ui_height}px`;
    cy.resize();
    cy.center();
}
window.addEventListener('resize', resize);
resize();