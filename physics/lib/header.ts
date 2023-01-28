export type RigidBody = { id: number };

export type Init = { transform_buffer: ArrayBufferLike };

export interface PhysicsEngine {
    // simulation / update step
    init: (...args: any[]) => void;
    update: (deltaTime: number) => void;

    // shape creation interface
    removeBody: (body: RigidBody) => void;
    createPlane: (...args: any[]) => void;
    createSphere: (...args: any[]) => void;
    createCapsule: (...args: any[]) => void;
    createTrimesh: (...args: any[]) => void;

    // actions and commands
    collisionTest?: (args: any) => void;
    addForce: (...args: any[]) => void;
    addForceConditionalRaycast: (...args: any[]) => void;
    addVelocity: (...args: any[]) => void;
    addVelocityConditionalRaycast: (...args: any[]) => void;
    raycast: (...args: any[]) => void;
}

export type Vec3
    = [number, number, number]
    ;
export type Quat
    = [number, number, number, number]
    ;

/** */
export type Force = {
    id: number;
    vector: Vec3;
};

/** */
export type Velocity = {
    id: number;
    vector: Vec3;
};

/** */
export type Raycast = {
    id: number;
    from: Vec3;
    to: Vec3;
};

/** */
export type ForceRaycast = {
    force: Force,
    raycast: Raycast
};

/** */
export type VelocityRaycast = {
    velocity: Velocity,
    raycast: Raycast
};

export class Workload {
    forces: Force[] = [];
    velocities: Velocity[] = [];
    raycasts: Raycast[] = [];
    force_raycasts: ForceRaycast[] = [];
    velocity_raycasts: VelocityRaycast[] = [];
}