(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define(['./random'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(require('./random'));
    } else { // Browser globals (root is window)
        root.rpgTools = (root.rpgTools || {});
        root.rpgTools.Dice = factory(root.rpgTools.random);
    }
}(this, function (random) {
    'use strict';

    function Dice (notation) {
        this.specials = {};
        this.parse(notation);
    }

    Dice.prototype = {
        constructor: Dice,

        // general tokenizing regexp
        notationRe: /(\d+)*d(\d+)*((\+\d+)|(\-\d+)|(-L)|(-H))*/,

        // regexp for recognizing +x and -x patterns at the end of notation
        additionRe: /(\+|\-)(\d+)/,

        // defaults
        defaultSides: 6,
        defaultRolls: 1,

        /**
         * Parses a notation
         * @param {String} notation e.g. "3d6+6"
         * @returns {Dice} this instance (for chaining)
         */
        parse: function (notation) {
            var tokens = this.notationRe.exec(notation);

            this.rolls = tokens[1] === undefined ? this.defaultRolls : parseInt(tokens[1]); // default if omitted
            this.sides = tokens[2] === undefined ? this.defaultSides : parseInt(tokens[2]); // default if omitted

            var after = tokens[3];
            var additionTokens;

            if (after) { // we have third part of notation
                if (after === '-L') {
                    this.specials.chooseLowest = true;
                } else if (after === '-H') {
                    this.specials.chooseHighest = true;
                } else {
                    additionTokens = this.additionRe.exec(after);
                    this.specials.add = parseInt(additionTokens[2]);
                    if (additionTokens[1] === '-') {
                        this.specials.add *= -1;
                    }
                }
            }

            return this;
        },

        /**
         * Perform rolls
         */
        roll: function () {
            var results = [];
            var rollResult;

            // collect roll results
            for (var i = this.rolls; i; i--) {
                results.push(random.int(this.sides));
            }

            if (this.specials.chooseLowest) { // choose lowest roll…
                rollResult = Math.min.apply(Math, results);
            } else if (this.specials.chooseHighest) { // …or highest
                rollResult = Math.max.apply(Math, results);
            } else { // or sum it up
                rollResult = results.reduce(function(accum, roll) { // this effectively sums up all elements in array
                    return accum + roll;
                }, 0);

                if (this.specials.add) { // add constant if any
                    rollResult += this.specials.add;
                }
            }

            return rollResult;
        }
    };

    return Dice;
}));