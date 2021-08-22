import { Vec3 } from 'cannon-es';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';
import { PhysicsData } from '../physics';

export default class PhysicsTestScript extends GameScript {
    init() {
        {
            const sphere = new Entity();
            const mesh = GraphicsUtils.makeBall(0.5);
            sphere.setComponent(GraphicsData, mesh);
            const body = this.physics.createSphere({
                mass: 1,
                pos: new Vec3(2, 50, 0),
            }, 0.5);
            sphere.setComponent(PhysicsData, body);
        }
        {
            const sphere = new Entity();
            const mesh = GraphicsUtils.makeBall(0.5);
            sphere.setComponent(GraphicsData, mesh);
            const body = this.physics.createSphere({
                mass: 1,
                pos: new Vec3(4, 50, 0),
            }, 0.5);
            sphere.setComponent(PhysicsData, body);
        }
    }
}
