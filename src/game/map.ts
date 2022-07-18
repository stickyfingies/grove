import GameScript from "../script";

import maps from '../json/maps.json';
import { Mesh, Quaternion, Vector3 } from "three";
import Entity from "../ecs/entity";
import { PhysicsData } from "firearm";
import { MeshData } from "3-AD";

export default class MapScript extends GameScript {
    async init() {
        // const floor = this.physics.createPlane({
        //     mass: 0
        // });

        const map = maps.main;
        const meshPromise = await this.assetLoader.loadModel(map.path);
        // const physicsMesh = await this.assetLoader.loadModel(map.physicsPath);
        const collideNames = ['mesh_5', 'mesh_6', 'mesh_8', 'mesh_9', 'mesh_10', 'mesh_19', 'mesh_19', 'mesh_21', 'mesh_22', 'mesh_24'];
        meshPromise.traverse((node) => {
            if (node instanceof Mesh) {
                const e = new Entity();
                if (collideNames.includes(node.name)) {
                    const worldPos = new Vector3();
                    const worldScale = new Vector3();
                    const worldQuat = new Quaternion();
                    node.getWorldPosition(worldPos);
                    node.getWorldScale(worldScale);
                    node.getWorldQuaternion(worldQuat);
                    const body = this.physics.createTrimesh({
                        pos: worldPos.toArray(),
                        scale: worldScale.toArray(),
                        quat: worldQuat.toArray(),
                    }, node.geometry);
                    e.setComponent(PhysicsData, body);
                }
                setTimeout(() => {
                    // @hack - Wtf was I smoking when I wrote this code?
                    // removing the timeout breaks the world ... somehow.
                    this.graphics.addObjectToScene(node);
                    e.setComponent(MeshData, node);
                }, 500);
            }
        });
    }
}