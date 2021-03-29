"use strict";

export default (globals) => {

    var solver = new CANNON.GSSolver();

    globals.world.allowSleep = true;
    globals.world.defaultContactMaterial.contactEquationStiffness = 1e9;
    globals.world.defaultContactMaterial.contactEquationRelaxation = 4;
    globals.world.defaultContactMaterial.friction = 2;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = false;
    if (split)
        globals.world.solver = new CANNON.SplitSolver(solver);
    else
        globals.world.solver = solver;

    globals.world.gravity.set(0, -25, 0);
    globals.world.broadphase = new CANNON.NaiveBroadphase();
    
};