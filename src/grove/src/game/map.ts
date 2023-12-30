import { GameSystem, world } from "@grove/engine";

import maps from '../json/maps.json';
import { Mesh, Quaternion, Vector3 } from "three";
import { PhysicsData, Quat, _threejs_geometry_to_buffer } from "@grove/physics";
import { MeshData } from '@grove/graphics';
import { assetLoader, graphics, physics } from "@grove/engine";

export default class MapScript extends GameSystem {
    async initialize() {
        // const floor = physics.createPlane({
        //     mass: 0
        // });

        const mapData = maps.testArena;
        const mapMesh = await assetLoader.loadModel({ uri: mapData.path });
        mapMesh.name = 'Map';
        mapMesh.traverse((node) => {
            if (node instanceof Mesh) {
                const worldPos = new Vector3();
                const worldScale = new Vector3();
                const worldQuat = new Quaternion();
                node.getWorldPosition(worldPos);
                node.getWorldScale(worldScale);
                node.getWorldQuaternion(worldQuat);

                const body = physics.createTrimesh({ mass: 0, isGhost: false, shouldRotate: true }, {
                    pos: worldPos.toArray(),
                    scale: worldScale.toArray(),
                    quat: worldQuat.toArray() as Quat,
                }, _threejs_geometry_to_buffer(node.geometry));

                world.spawn([PhysicsData], [body]);
            }
        });
        
        world.spawn([MeshData], [mapMesh]);
    }
}