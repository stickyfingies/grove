# ECS

This package contains code for logically representing the game world.

## Theory

Everythihg
- has **properties**
- enacts **behaviors**

A duck **is** yellow, and it **does** quack when it's hungry.

The ECS allows you to express behaviors as relationships between properties, and surprisingly, this is a very powerful mechanism for game developers.

## World

An `EntityManager` stores components in linear memory so that it's very fast to run code repeatedly on all components of a type.

> In reality, the V8 JavaScript Engine might be storing an array of pointers, which defeats the performance benefit.

## Entity

An entity is a unique map between a set of types and a set of data.

```mermaid
flowchart LR

    subgraph Types
    direction LR
        Velocity
        Position
    end

    subgraph Data
    direction LR
        vel["{ x: 0, y: 1 }"]
        pos["{ x: 3, y: 4 }"]
    end

    Types ===>|entity| Data
```

We can use `world.spawn(types, data)` to make an entity.

```ts
import { EntityManager } from '@grove/ecs';

class Velocity {
    x: number = 0;
    y: number = 0;
};

class Position {
    x: number = 0;
    y: number = 0;
};

const world = new EntityManager();

const entity = world.spawn(
    [Position, Velocity],
    [{ x: 0, y: 1}, { x: 3, y: 4 }]
);
```

## Rules

Rules are behaviors that get executed every frame.

Rules have a **name**, and **each frame** they act upon a **group** of entities.

- The **group** is a set of component types this rule applies to.

- The **each_frame** function is called once each frame, for each entity that falls within the group.

For example, imagine a rule that synchronizes renderable objects with their physically simulated positions.

```mermaid
flowchart LR
Physics -->|copy_position| Mesh
```

This rule operates on the (`Physics`, `Mesh`) group, and the function is `copy_position`.  Here's how it looks in code:

```ts
/**
 * @example demonstrating a rule which applies
 * a physically-simulable entity's position
 * onto its mesh, thus visually moving it
 * across the screen.
 **/

import { EntityManager } from '@grove/ecs';
import { PhysicsData, PhysicsEngine } from '@grove/physics';
import { MeshData } from '@grove/graphics';

declare let physics: PhysicsEngine<unknown>;
declare let world: EntityManager;

world.addRule({
    name: 'Physics affects graphics',
    group: [PhysicsData, MeshData],
    each_frame([body, mesh]) {
        const [px, py, pz] = physics.getBodyPosition(body);
        mesh.position.set(px, py, pz);
    }
});
```

## Effects

Effects happen when a component is added to, or removed from, an entity.

Here's an example that uses effects to automate some boring work, like adding or removing a mesh from the scene graph.

```ts
/**
 * @example demonstrating an effect which
 * adds newly created meshes to the scene
 * and removes recently removed meshes
 * from the scene.
 **/

import { EntityManager } from '@grove/ecs';
import { Mesh, Scene } from 'three';

const world = new EntityManager();

const scene = new Scene();

world.useEffect({
    type: Mesh,
    add(entity, mesh) {
        scene.add(mesh);
    },
    remove(entity, mesh) {
        scene.remove(mesh);
    }
});
```