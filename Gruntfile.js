module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                files: {
                    'build/module.js': ['client/scripts/**/*.js', 'client/scripts/**/*.coffee']
                },
                options: {
                    transform: ['coffeeify']
                }
            },
            watch: true
        }

    });

    // Load the plugin that provides the "coffee" task.
    grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    grunt.registerTask('build', ['browserify']);

};