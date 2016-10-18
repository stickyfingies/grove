/* global THREE */
require.config({
    baseUrl: '/js/app',
    paths: {
        'rpg': '/js/vendor/rpg-tools/lib'
    }
});

console.log('Initializing require.js AMD - /js/app/main.js');

require(
    [
    'globals',
    'player/manager',
    'engine/load',
    'engine/init/manager',
    'engine/animate',
    'shooting',
    'multiplayer'
    ],

    (globals, player, load, init, animate, shooting, multiplayer) => {

        animate();

    }
);