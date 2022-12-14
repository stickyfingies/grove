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

        const map = maps.skjarIsles;
        const mapMesh = await assetLoader.loadModel(map.path);
        // const physicsMesh = await this.assetLoader.loadModel(map.physicsPath);
        // const collideNames = map.collideNames;
        mapMesh.traverse((node) => {
            if (node instanceof Mesh) {
                const mapFragment = world.createEntity();
                // if (collideNames.includes(node.name)) {
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
                world.setComponent(mapFragment, PhysicsData, body);
                // }
                setTimeout(() => {
                    // @hack - Wtf was I smoking when I wrote this code?
                    // removing the timeout breaks the world ... somehow.
                    graphics.addObjectToScene(node);
                    world.setComponent(mapFragment, MeshData, node);
                }, 500);
            }
        });
    }
}