import { Vector3 } from 'three';
import Entity from '../ecs/entity';
import { Physics, PhysicsData } from '../physics';
import { CameraData, CAMERA_TAG, GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import GameScript from '../script';
import { PLAYER_TAG } from './player';

/** Shoots a ball outwards from an entity in an indicated direction */
export const shoot = (origin: Entity, shootDir: Vector3) => {
    const ball = new Entity();

    const { x: px, y: py, z: pz } = origin.getComponent(PhysicsData).position;
    const { x: vx, y: vy, z: vz } = origin.getComponent(PhysicsData).velocity;
    const { x: sdx, y: sdy, z: sdz } = shootDir;

    const radius = 0.3;
    const mass = 10;
    const shootVelo = 40;

    const body = Physics.makeBall(mass, radius);
    body.velocity.set(vx + sdx * shootVelo, vy + sdy * shootVelo, vz + sdz * shootVelo);
    body.position.set(px + sdx * 5, py + sdy * 5, pz + sdz * 5);
    ball.setComponent(PhysicsData, body);

    const mesh = GraphicsUtils.makeBall(radius);
    ball.setComponent(GraphicsData, mesh);

    const collideCb = () => {
        body.removeEventListener('collide', collideCb);
        setTimeout(ball.delete, 1500);
    };

    body.addEventListener('collide', collideCb);

    return ball;
};

/** get a ThreeJS vector pointing outwards from the camera */
const getCameraDir = () => {
    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
};

export default class ShootingScript extends GameScript {
    init() {
        document.addEventListener('mousedown', () => {
            if (this.engine.running) shoot(Entity.getTag(PLAYER_TAG), getCameraDir());
        });
    }
}
