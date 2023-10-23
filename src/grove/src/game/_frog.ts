import { MeshData } from '@grove/graphics';
import { assetLoader, graphics, world } from '@grove/engine';
import { PhysicsData } from '@grove/physics';
import { Mesh } from 'three';
import { CreateEntityEvent, DeleteComponentEvent, DeleteEntityEvent, SetComponentEvent, SignatureChangedEvent } from '@grove/ecs/lib/entity-manager';
import { AssetsLoadedEvent } from '@grove/engine/lib/load';

/**
 * This is defined in `grove/app/preload.cjs`
 */
declare const webApi: any;

type GraphData = {
    assets: any[],
    components: any[]
};

interface MessageData {
    type: 'do' | 'undo' | 'redo' | 'meta',
    action: string,
    args: any[]
};

///////////////////////
/// FRAMEWORK STUFF ///
///////////////////////

function connectToServer(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const server = new WebSocket('ws://localhost:3334/?name=Grove');
        server.onopen = () => resolve(server);
        server.onerror = reject;
    });
}
const socket = await connectToServer();

function defineBatchAction(action: string, func: Function) {
    socket.addEventListener('message', (event) => {
        const data: MessageData = JSON.parse(event.data);
        if (data.action === action) func(data.args);
    });
}

function defineAction(action: string, func: (value: any) => void) {
    socket.addEventListener('message', (event) => {
        const data: MessageData = JSON.parse(event.data);
        if (data.action === action) data.args.forEach(func);
    });
}

function commit(action: string, args: any) {
    socket.send(JSON.stringify({ type: 'do', action, args }));
}

///////////////////////////
/// INTERACTIVITY STUFF ///
///////////////////////////

world.events.on('createEntity', ({ entity_id }: CreateEntityEvent) => {
    commit('createEntity', { entity_id });
});

world.events.on('deleteEntity', ({ entity_id }: DeleteEntityEvent) => {
    commit('deleteEntity', { entity_id });
});

world.events.on('signatureChanged', ({ old_signature, new_signature, added_components, removed_components }: SignatureChangedEvent) => {
    commit('signatureChanged', {
        old_signature: Array.from(old_signature).map((e) => e.name),
        new_signature: Array.from(new_signature).map((e) => e.name),
        added_components: Array.from(added_components).map((e) => e.name),
        removed_components: Array.from(removed_components).map((e) => e.name)
    });
});

world.events.on('deleteMeshComponent', ({ data: mesh }: DeleteComponentEvent) => {
    commit('removeMesh', { mesh_id: mesh.id });
});

assetLoader.events.on('assetsLoaded', (event: AssetsLoadedEvent) => {
    commit('assetsLoaded', event);
});

const dataMappers = new Map<string, Function>();

dataMappers.set('Mesh', (entity_id: number, data: Mesh) => {
    const meshes: object[] = [];
    data.traverse((mesh: any) => {
        const parent = mesh.parent.isScene ? undefined : mesh.parent.id;
        meshes.push({ mesh_id: mesh.id, entity_id, name: mesh.name, parent });
    });
    return meshes;
})

world.events.on('setComponent', ({ entity_id, name, data }: SetComponentEvent) => {
    if (dataMappers.has(name)) {
        const mapper = dataMappers.get(name)!;
        data = mapper(entity_id, data);
    }
    commit(`add${name}`, { entity_id, data });
});

defineAction('removeMesh', ({ id }: { id: string }) => {
    const mesh = graphics.scene.getObjectById(Number(id));
    if (!mesh) return console.error('(remote) -> (local): Cannot Delete non-existent mesh');
    graphics.removeObjectFromScene(mesh);
});

/*
 * This is for when a user presses 'export' on an entity in the graph editor.
 */
webApi.handleGraphData((data: GraphData) => {
    const { assets, components } = data;
    if (!assets) return console.log(data);
    const assetTable: Record<string, any> = {};
    assets.forEach(async ({ id, src }) => {
        let asset = src;
        // optimized in-place
        if (src !== 'sphere') {
            asset = assetLoader.loadModel({ uri: src });
        }
        assetTable[id] = asset;
    })
    console.log(assetTable);

    const entity = world.createEntity();

    components.forEach(async (data) => {
        if (data.type === 'component.mesh') {
            // assumes 'asset' is 'model'
            const asset = await assetTable[data.asset_id];
            graphics.addObjectToScene(asset);
            world.put(entity, [MeshData], [asset]);
        }
        if (data.type === 'component.body') {
            const asset = await assetTable[data.asset_id];
            const body = (function parseShape(asset: string) {
                switch (asset) {
                    case 'sphere': {
                        // return physics.createSphere({
                        //     mass: 100,
                        //     pos: [0, 120, 0],
                        //     shouldRotate: false,
                        //     radius: 1
                        // });
                    }
                    default: {
                        console.error(`${asset} is not a recognized asset source`);
                        return null;
                    }
                }
            })(asset);
            if (body) world.put(entity, [PhysicsData], [body]);
        }
        return null;
    });

    console.log(components);
});