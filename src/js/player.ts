"use strict";

class Player {
    hp: { val: number, max: number };
    mp: { val: number, max: number };
    xp: { level: number, xp: number, max: number };
    equipped: any;
    inventory: any;
    hotbar: any;

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
    }
}

let player = new Player();

export default player;
