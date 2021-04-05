import { Body, Shape } from 'cannon-es';
import { Object3D } from 'three';

export const entityList = [] as any;

// eslint-disable-next-line max-len
export const addEntity = (body: Body, shape: Shape, mesh: Object3D, norotate = false) => entityList.push({
  body, shape, mesh, norotate,
}) - 1;

export const getEntity = (id: number) => entityList[id];
