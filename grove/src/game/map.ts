import { GameSystem, world } from "@grove/engine";

import maps from '../json/maps.json';
import { Mesh, Quaternion, Vector3 } from "three";
import { PhysicsData } from "@grove/physics";
import { MeshData } from '@grove/graphics';
import { assetLoader, graphics, physics } from "@grove/engine";

export default class MapScript extends GameSystem {
    async init() {
        // const floor = physics.createPlane({
        //     mass: 0
        // });

        const mapData = maps.skjarIsles;
        const map = world.createEntity();
        const mapMesh = await assetLoader.loadModel(mapData.path);
        mapMesh.name = 'Map';
        mapMesh.traverse((node) => {
            if (node instanceof Mesh) {
                const worldPos = new Vector3();
                const worldScale = new Vector3();
                const worldQuat = new Quaternion();
                node.getWorldPosition(worldPos);
                node.getWorldScale(worldScale);
                node.getWorldQuaternion(worldQuat);

                const body = physics.createTrimesh({
                    pos: worldPos.toArray(),
                    scale: worldScale.toArray(),
                    // quat: worldQuat.toArray(),
                }, node.geometry);

                const mapFragment = world.createEntity();
                world.setComponent(mapFragment, [PhysicsData], [body]);
            }
        });
        graphics.addObjectToScene(mapMesh);
        world.setComponent(map, [MeshData], [mapMesh]);
    }
}