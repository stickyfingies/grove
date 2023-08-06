// export type RigidBody = { id: number };

export type Init = { transform_buffer: ArrayBufferLike };

export type CollisionCallback = (entity: number) => void;

export interface PhysicsEngine<RigidBody> {
    // simulation / update step
    init: (...args: any[]) => void;
    update: (deltaTime: number) => void;

    // !deprecated (?)
    getBodyPosition: (body: RigidBody) => Vec3;

    // shape creation interface
    removeBody: (body: RigidBody) => void;
    createPlane: (rbdesc: RigidBodyDescription, t: Transform) => RigidBody;
    createSphere: (rbdesc: RigidBodyDescription, t: Transform, s: SphereShapeDescription) => RigidBody;
    createCapsule: (rbdesc: RigidBodyDescription, t: Transform, s: CapsuleShapeDescription) => RigidBody;
    createTrimesh: (rbdesc: RigidBodyDescription, t: Transform, s: TriangleMeshShapeDescription) => RigidBody;

    // actions and commands
    registerCollisionCallback: (body: RigidBody, cb: CollisionCallback) => void;
    removeCollisionCallback: (body: RigidBody) => void;
    addForce: (f: Force<RigidBody>) => void;
    addForceConditionalRaycast: (f: ForceRaycast<RigidBody>) => void;
    addVelocity: (v: Velocity<RigidBody>) => void;
    addVelocityConditionalRaycast: (v: VelocityRaycast<RigidBody>) => void;
    raycast: (r: Raycast) => void;
}

export type Vec3
    = [number, number, number]
    ;
export type Quat
    = [number, number, number, number]
    ;

export type Transform = {
    pos: Vec3,
    scale: Vec3,
    quat: Quat,
}

export class RigidBodyDescription {
    mass: number = 1;
    isGhost: boolean = false;
    shouldRotate: boolean = true;
}

export type SphereShapeDescription = {
    radius: number,
}

export type CapsuleShapeDescription = {
    radius: number,
    height: number,
}

export type TriangleMeshShapeDescription = ArrayBufferLike;

/** */
export type Force<RigidBody> = {
    object: RigidBody;
    vector: Vec3;
};

/** */
export type Velocity<RigidBody> = {
    object: RigidBody;
    vector: Vec3;
};

/** */
export type Raycast = {
    id: number;
    from: Vec3;
    to: Vec3;
};

/** */
export type ForceRaycast<RigidBody> = {
    force: Force<RigidBody>,
    raycast: Raycast
};

/** */
export type VelocityRaycast<RigidBody> = {
    velocity: Velocity<RigidBody>,
    raycast: Raycast
};

export class Workload<RigidBody> {
    forces: Force<RigidBody>[] = [];
    velocities: Velocity<RigidBody>[] = [];
    raycasts: Raycast[] = [];
    force_raycasts: ForceRaycast<RigidBody>[] = [];
    velocity_raycasts: VelocityRaycast<RigidBody>[] = [];
}