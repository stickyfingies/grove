module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            client: {
                src: ['src/**/*.js'],
                dest: 'public/js/build/latest.js',
                options: {}
            },
            watch: true
        }

    });

    // Load the plugin that provides the "coffee" task.
    grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    grunt.registerTask('build', ['browserify']);

};