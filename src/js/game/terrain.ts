import SimplexNoise from 'simplex-noise';
import { Quaternion as CQuaternion, Vec3 } from 'cannon-es';
import {
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    PlaneBufferGeometry,
    Quaternion,
    Vector3,
} from 'three';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { MeshData } from '../graphics/graphics';
import { Physics, PhysicsData } from '../physics';

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

    const geometry = new PlaneBufferGeometry(size, size, resolution, resolution);
    const nonIndexed = geometry.toNonIndexed();
    const positionAttrib = nonIndexed.getAttribute('position');

    // formula taken from https://codepen.io/ptc24/pen/BpXbOW?editors=0010
    for (let i = 0; i < positionAttrib.count; i++) {
        const x = positionAttrib.getX(i) + posX * size;
        const y = positionAttrib.getY(i) + posZ * size;
        const v = (1.0 * noise.noise2D(1 * x, 1 * y))
                + (0.5 * noise.noise2D(2 * x, 2 * y))
                + (0.25 * noise.noise2D(4 * x, 4 * y));
        positionAttrib.setZ(i, v);
    }

    nonIndexed.getAttribute('position').needsUpdate = true;
    nonIndexed.computeVertexNormals();

    const plane = new Mesh(nonIndexed, new MeshPhongMaterial({
        color: color ?? 0x228822,
        side: DoubleSide,
    }));
    plane.translateX(posX * size);
    plane.translateZ(posZ * size);
    plane.rotateX(Math.PI / 2);

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
    fuck.setComponent(MeshData, plane);
    // setTimeout(() => fuck.setComponent(PhysicsData, body), 1500);
    fuck.setComponent(PhysicsData, body);
};

export default class TerrainScript extends GameScript {
    // eslint-disable-next-line
    init() {
        const noise = new SimplexNoise(Math.random());

        const chunkSize = 128;
        const chunkResolution = 42;

        for (let x = -3; x < 3; x++) {
            for (let y = -3; y < 3; y++) {
                createChunk(this.physics, noise, {
                    size: chunkSize,
                    resolution: chunkResolution,
                    posX: x,
                    posZ: y,
                });
            }
        }
    }
}
