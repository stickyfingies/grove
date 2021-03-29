"use strict";

import ProtoTree from "rpg-tools/lib/ProtoTree";

import base from "./json/base";
import weapons from "./json/weapons";
import materials from "./json/mats";

Object.assign(base, weapons, materials);
let pt = new ProtoTree(base);

export default callback => {
    pt = new ProtoTree(base);
    callback(pt, setUpSword);
};

function setUpComponent(comp, mat) {
    let c = pt.get(comp),
        m = pt.get(mat);
    c.mat = m;
    c.dmg = m.dmg;
    c.spd = m.spd;
    c.dur = m.dur;
    c.name = 'test';
    let clone = JSON.parse(JSON.stringify(c));
    return clone;
}


// makes a sword and returns it; should be in JSON

function setUpSword(type, mat1, mat2) {
    let sword = pt.get(type ? 'longsword' : 'shortsword'),
        blade = setUpComponent('@blade', mat1),
        handle = setUpComponent('@handle', mat2);
    sword.blade = blade;
    sword.handle = handle;
    sword.name = `${sword.blade.mat.name} ${sword.name}`;
    sword.dmg = (blade.dmg + handle.dmg) / 2;
    sword.spd = (blade.spd + handle.spd) / 2;
    sword.slot = 'weapon';
    sword.icon = 'two-handed-sword.svg';
    sword.id = Math.random(); // for debugging purposes
    let clone = JSON.parse(JSON.stringify(sword)); // EXTREME workaround but hey it works... :D
    sword = null;
    clone.id = Math.random();
    return clone;
}
