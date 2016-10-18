/* global CANNON */

define(['globals'], function (globals) {
    var solver = new CANNON.GSSolver();

    globals.world.defaultContactMaterial.contactEquationStiffness = 1e9;
    globals.world.defaultContactMaterial.contactEquationRelaxation = 4;
    globals.world.defaultContactMaterial.friction = 1e9;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        globals.world.solver = new CANNON.SplitSolver(solver);
    else
        globals.world.solver = solver;

    globals.world.gravity.set(0, -20, 0);
    globals.world.broadphase = new CANNON.NaiveBroadphase();

    return {
        loaded: true
    };

});