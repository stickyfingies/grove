import SimplexNoise from 'simplex-noise';
import { Quaternion as CQuaternion, Vec3 } from 'cannon-es';
import {
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Quaternion,
    Vector3,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import { Physics } from '../physics';

type ChunkOptions = {
    posX: number;
    posZ: number;
    size: number;
    resolution: number;
    color?: number;
}

const createChunk = (physics: Physics, noise: SimplexNoise, options: ChunkOptions) => {
    const {
        size, resolution, posX, posZ, color,
    } = options;

    const geometry = new PlaneGeometry(size, size, resolution, resolution);
    const nonIndexed = geometry.toNonIndexed();
    const positionAttrib = nonIndexed.getAttribute('position');

    // formula taken from https://codepen.io/ptc24/pen/BpXbOW?editors=0010
    for (let i = 0; i < positionAttrib.count; i++) {
        const x = positionAttrib.getX(i) + posX * size;
        const y = positionAttrib.getY(i) + posZ * size;
        const ex = 0.3;
        const v = (noise.noise2D(x / 100, y / 100)
            + (noise.noise2D((x + 200) / 50, y / 50) * (ex ** 1))
            + (noise.noise2D((x + 400) / 25, y / 25) * (ex ** 2))
            + (noise.noise2D((x + 600) / 12.5, y / 12.5) * (ex ** 3))
            + +(noise.noise2D((x + 800) / 6.25, y / 6.25) * (ex ** 4))
        ) / 0.125;
        positionAttrib.setZ(i, v);
    }

    nonIndexed.getAttribute('position').needsUpdate = true;
    nonIndexed.computeVertexNormals();

    const plane = new Mesh(nonIndexed, new MeshPhongMaterial({
        color: color ?? 0x228822,
    }));
    plane.translateX(posX * size);
    plane.translateZ(posZ * size);
    plane.rotateX(-Math.PI / 2);

    const worldPos = new Vector3();
    const worldScale = new Vector3();
    const worldQuat = new Quaternion();
    plane.getWorldPosition(worldPos);
    plane.getWorldScale(worldScale);
    plane.getWorldQuaternion(worldQuat);

    const body = physics.createTrimesh({
        pos: new Vec3(worldPos.x, worldPos.y, worldPos.z),
        scale: new Vec3(worldScale.x, worldScale.y, worldScale.z),
        quat: new CQuaternion(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w),
    }, nonIndexed);

    const fuck = new Entity();
    fuck.setComponent(GraphicsData, plane);
    // setTimeout(() => fuck.setComponent(PhysicsData, body), 1500);
    // fuck.setComponent(PhysicsData, body);
};

export default class TerrainScript extends GameScript {
    // eslint-disable-next-line
    init() {
        const noise = new SimplexNoise(3);

        const chunkSize = 128;
        const chunkResolution = 64;

        createChunk(this.physics, noise, {
            size: chunkSize,
            resolution: chunkResolution,
            posX: 0,
            posZ: 0,
        });
        createChunk(this.physics, noise, {
            size: chunkSize,
            resolution: chunkResolution,
            posX: 1,
            posZ: 0,
            color: 0x882222,
        });
    }
}
