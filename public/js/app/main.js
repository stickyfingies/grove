requirejs.config({
    baseUrl: '/js/app'
});

console.log('Initializing require.js AMD - /js/app/main.js');

requirejs(['init', 'animate', 'shooting'], function (init, animate, shooting) {
    init();
    animate();
    shooting();
});