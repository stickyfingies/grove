(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define([], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory();
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.utils = factory();
    }
}(this, function () {
    'use strict';

    var toString = Object.prototype.toString;

    function isString (value) {
        return toString.call(value) === '[object String]';
    }

    function isNumber (value) {
        return toString.call(value) === '[object Number]';
    }

    function isObject (value) {
        var type = typeof value;
        return !Array.isArray(value) && (type === 'object' && !!value);
    }

    function keyPath (target, path, value) {
        var chunks = path.split('.');

        if (chunks.length === 1) {
            if (arguments.length === 2) {
                return target[path];
            } else {
                target[path] = value;
                return value;
            }
        }

        var i = 1;
        var len = chunks.length;
        var chunk = chunks[0];
        var current = target[chunk];

        if (arguments.length === 2) {
            while (i < len) {
                chunk = chunks[i];
                current = current[chunk];
                i++;
            }

            return current;
        } else {
            while (i < len - 1) {
                chunk = chunks[i];
                current = current[chunk];
                i++;
            }

            current[chunks[i]] = value;

            return value;
        }
    }

    function clone (value) {
        if (isObject(value)) {
            return JSON.parse(JSON.stringify(value));
        } else {
            return value;
        }
    }

    var exports = {
        isString: isString,
        isNumber: isNumber,
        isObject: isObject,
        keyPath: keyPath,
        clone: clone
    };

    return exports;
}));
