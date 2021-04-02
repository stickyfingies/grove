"use strict";

import { Body, Shape } from "cannon-es";
import { Object3D } from "three";

export let entityList = [] as any;

export const addEntity = (body: Body, shape: Shape, mesh: Object3D, norotate = false) => {
    return entityList.push({ body, shape, mesh, norotate }) - 1;
}

export const getEntity = (id: number) => entityList[id];