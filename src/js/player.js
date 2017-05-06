/* global $ */

class Player {
    constructor() {
        this.hp = {
            val: 10, // current hp
            max: 10 // max hp.  No min, cuz if it reaches 0, ur dead.  fun thoughts
        };
        this.mp = {
            val: 5, // see hp
            max: 5
        };
        this.xp = {
            level: 0, // level
            xp: 3, // current xp
            max: 10 // xp needed till lvl up
        };
        this.equipped = {
            weapon: null
        };
        this.inventory = [];
        this.hotbar = {
            list: [],
            selected: 1,
            active: null
        };

        require('./items')((pt, sword) => {
            this.inventory.push(sword(0, 'iron', 'wood'));
            this.inventory.push(sword(0, 'ebony', 'iron'));
        });

    }
}

let player = new Player();

module.exports = player;
