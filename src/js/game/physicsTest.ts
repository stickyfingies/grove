import { Vec3 } from 'cannon-es';

import Entity from '../ecs/entity';
import GameScript from '../script';
import { GraphicsData } from '../graphics/graphics';
import GraphicsUtils from '../graphics/utils';

export default class PhysicsTestScript extends GameScript {
    sphere: Entity;

    rbId: number;

    init() {
        this.rbId = this.physics.createSphere(new Vec3(2, 150, 0));

        this.sphere = new Entity();
        const mesh = GraphicsUtils.makeBall(1);
        this.sphere.setComponent(GraphicsData, mesh);
    }

    update() {
        const mesh = this.sphere.getComponent(GraphicsData);

        const pos = this.physics.getBodyPosition(this.rbId);

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;
    }
}
