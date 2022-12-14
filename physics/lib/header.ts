export type RigidBody = { id: number };

export interface PhysicsEngine {
    init: (...args: any[]) => void;
    update: (deltaTime: number) => void;
    removeBody: (body: RigidBody) => void;
    collisionTest?: (args: any) => void;
    createPlane: (...args: any[]) => void;
    createSphere: (...args: any[]) => void;
    createCapsule: (...args: any[]) => void;
    createTrimesh: (...args: any[]) => void;
    addForce: (...args: any[]) => void;
    addForceConditionalRaycast: (...args: any[]) => void;
    addVelocity: (...args: any[]) => void;
    addVelocityConditionalRaycast: (...args: any[]) => void;
    raycast: (...args: any[]) => void;
}