"use strict";

import {GSSolver, SplitSolver, NaiveBroadphase} from "cannon-es";

export default (world) => {
    world.allowSleep = true;
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;
    world.defaultContactMaterial.friction = 2;

    let solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;

    const split = false;
    world.solver = split ? new SplitSolver(solver) : solver;

    world.gravity.set(0, -25, 0);
    world.broadphase = new NaiveBroadphase();
};