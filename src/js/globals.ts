import { Body } from 'cannon-es';
import { Mesh } from 'three';

interface Globals {
    remove: {
        bodies: Body[],
        meshes: Mesh[]
    }
}

const G: Globals = {
  remove: {
    bodies: [],
    meshes: [],
  },
};

export default G;
