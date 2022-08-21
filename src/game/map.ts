import { GameSystem } from "../script";

import maps from '../json/maps.json';
import { Mesh, Quaternion, Vector3 } from "three";
import Entity from "../ecs/entity";
import { PhysicsData } from "firearm";
import { MeshData } from "3-AD";
import { assetLoader, graphics, physics } from "../engine";

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
                const mapFragment = new Entity();
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
                    quat: worldQuat.toArray(),
                }, node.geometry);
                mapFragment.setComponent(PhysicsData, body);
                // }
                setTimeout(() => {
                    // @hack - Wtf was I smoking when I wrote this code?
                    // removing the timeout breaks the world ... somehow.
                    graphics.addObjectToScene(node);
                    mapFragment.setComponent(MeshData, node);
                }, 500);
            }
        });
    }
}