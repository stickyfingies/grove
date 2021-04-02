"use strict";

import { World, Body } from "cannon-es";
import { Mesh } from "three";

interface Globals {
    world: World,
    remove: {
        bodies: Body[],
        meshes: Mesh[]
    }
};

let G: Globals = {
    world: new World(),
    remove: {
        bodies: [],
        meshes: []
    }
};

export default G;