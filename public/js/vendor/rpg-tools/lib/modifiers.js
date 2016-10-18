(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define(['./utils'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(require('./utils'));
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.modifiers = factory(root.rpgTools.utils);
    }
}(this, function (utils) {
    'use strict';

    var percentRe = /([+\-]?)(\d+)%/;

    /**
     * Parses and applies modifiers to given value
     * @param {Number} num basic value
     * @param {String|Number} modifier e.g. '+15%' or -4
     * @returns {Number}
     */
    function apply (num, modifier) {
        if (!modifier) { // if modifier is non-existent
            return num;
        }

        if (utils.isString(modifier)) {
            var parts = modifier.match(percentRe); // e.g. '-15%'
            var quotient = Number(parts[1] + parts[2]) / 100; // Number('-' + '15')
            num += num * quotient;
        } else if (utils.isNumber(modifier)) {
            num += modifier;
        }

        return num;
    }

    /**
     * Applies modifiers, described in object, to `src`
     * @param {Object} src object which receives modificators
     * @param {Object} modifier object containing modifiers
     * @param {boolean} [overWrite=false] create new object or modify `src`
     */
    function applyObject (src, modifier, overWrite) {
        var dest = overWrite ? src : utils.clone(src);
        var modNames = Object.keys(modifier);
        if (!modNames.length) {
            return dest;
        }

        var modificationPath;
        var modificationValue;
        var oldValue;
        var newValue;

        for (var i = modNames.length - 1; i >= 0; i--) {
            modificationPath = modNames[i];
            oldValue = utils.keyPath(src, modificationPath);
            if (!utils.isNumber(oldValue)) {
                continue;
            }

            modificationValue = modifier[modificationPath];
            newValue = apply(oldValue, modificationValue);
            utils.keyPath(dest, modificationPath, newValue);
        }

        return dest;
    }

    /**
     * Applies array of modifier object. Note that order of application matters!
     * @param {Object} src object which receives modificators
     * @param {Array.<Object>} modifiers array of objects, containing modifiers
     * @param {boolean} [overWrite=false] create new object or modify `src`
     */
    function applyMulti (src, modifiers, overWrite) {
        if (!Array.isArray(modifiers)) {
            throw new TypeError('"modifiers" should be array');
        }

        var dest = overWrite ? src : utils.clone(src);

        for (var i = 0, len = modifiers.length; i < len; i++) {
            dest = applyObject(dest, modifiers[i], true);
        }

        return dest;
    }

    var exports = {
        apply: apply,
        applyObject: applyObject,
        applyMulti: applyMulti
    };

    return exports;
}));