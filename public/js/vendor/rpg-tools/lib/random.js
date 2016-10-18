(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define([], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory();
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.random = factory();
    }
}(this, function () {
    'use strict';

    /**
     * Returns a random integer between min (included) and max (excluded).
     * With only one parameter given, min will be considered 0
     * @param {number} min inclusive low border. If omitted, this will be max
     * @param {number} [max] exclusive high border
     * @return {number}
     */
    function randomInt (min, max) {
        if (arguments.length === 1) {
            max = min;
            min = 0;
        }

        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Return random sign: -1 or 1.
     * @return {number}
     */
    function randomSign () {
        return 1 - 2 * randomInt(2);
    }

    /**
     * Get random array or object key
     * @param {Array|Object} source
     * @returns {Number|String}
     */
    function getRandomKey (source) {
        if (Array.isArray(source)) {
            return Math.floor(Math.random() * source.length);
        } else {
            var keys = Object.keys(source);
            return keys[getRandomKey(keys)];
        }
    }

    /**
     * Get random value from array or object
     * @param {Array|Object} source
     * @return {Object}
     */
    function getRandomItem (source) {
        var key = getRandomKey(source);
        return source[key];
    }

    var exports = {
        int: randomInt,
        sign: randomSign,
        key: getRandomKey,
        item: getRandomItem
    };

    return exports;
}));