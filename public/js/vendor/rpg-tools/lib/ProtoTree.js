(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define(['./utils'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(require('./utils'));
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.ProtoTree = factory(root.rpgTools.utils);
    }
}(this, function (utils) {
    'use strict';

    function ProtoTree (tree) {
        this._tree = tree;
        this._processed = Object.create(null);
    }

    ProtoTree.prototype = {
        constructor: ProtoTree,

        derive: function (obj) {
            var proto = this._processed[obj.proto];

            if (proto) {
                return this.deepDefaults(obj, proto);
            } else {
                proto = this._tree[obj.proto];
            }

            if (!proto) {
                throw new TypeError('Invalid proto specified for ' + obj.name);
            }
            obj.proto = proto.proto;

            return this.deepDefaults(obj, proto);
        },

        get: function (name) {
            var item = this._processed[name];

            if (item) {
                return item;
            } else {
                item = this._tree[name];
            }

            if (!item) {
                throw new RangeError('No such object in given tree as ' + name);
            }

            while (('proto' in item) && item.proto) {
                item = this.derive(item);
            }

            // should be undefined or otherwise falsy, so we don't need it anyway
            delete item.proto;

            this._processed[name] = item;

            return item;
        },

        deepDefaults: function (obj, defaults) {
            Object.keys(defaults).forEach(function (key) {
                if (utils.isObject(defaults[key])) {
                    if (obj[key] === undefined) {
                        obj[key] = {};
                    }

                    obj[key] = this.deepDefaults(obj[key], defaults[key]);
                } else if (Array.isArray(defaults[key])) {
                    if (obj[key] === undefined) {
                        obj[key] = [];
                    }

                    obj[key] = this.deepDefaults(obj[key], defaults[key]);
                } else if (obj[key] === undefined) {
                    obj[key] = defaults[key];
                }
            }, this);

            return obj;
        }
    };

    return ProtoTree;
}));