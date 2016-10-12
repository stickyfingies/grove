require.config({
    baseUrl: '/js/app'
});

console.log('Initializing require.js AMD - /js/app/main.js');

require(['init', 'animate', 'shooting'], function (init, animate, shooting) {
    // init && shooting work done in module
    animate();
});