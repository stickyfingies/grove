(function (root, factory) {
    'use strict';
    /* global define, module, require */

    if (typeof define === 'function' && define.amd) { // AMD
        define(['./lib/Dice', './lib/inventory', './lib/modifiers', './lib/ProtoTree', './lib/random', './lib/requirements'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(
            require('./lib/Dice'),
            require('./lib/inventory'),
            require('./lib/modifiers'),
            require('./lib/ProtoTree'),
            require('./lib/random'),
            require('./lib/requirements')
        );
    } else { // Browser globals (root is window)
        var modules = ['Dice', 'inventory', 'modifiers', 'ProtoTree', 'random', 'requirements'];
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools = factory.apply(null, modules.map(function (module) { return root.rpgTools[module]; }));
    }
}(this, function (Dice, inventory, modifiers, ProtoTree, random, requirements) {
    'use strict';

    var exports = {
        Dice: Dice,
        inventory: inventory,
        modifiers: modifiers,
        ProtoTree: ProtoTree,
        random: random,
        requirements: requirements
    };

    return exports;
}));