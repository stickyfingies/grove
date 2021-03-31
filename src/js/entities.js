"use strict";

export let entityList = [];

export const addEntity = (body, shape, mesh, norotate=false) => {
    return entityList.push({ body, shape, mesh, norotate }) - 1;
}

export const getEntity = (id) => entityList[id];