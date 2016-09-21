'use strict';
/**
 * @class AI         AI class for The Grove
 * @param pos:       THREE.Vector3 Coordinates
 * @param hp:        health
 * @param dmg:       damage
 * @param karma:     good/evil level of AI
 * @param agg:       aggressiveness/passiveness of AI
 */
class AI {
    constructor(pos, hp, dmg, karma, agg, name, music) {
        [this.pos, this.hp, this.dmg, this.karma, this.agg, this.name, this.music] = arguments;
    }
    loop() {}
    load(path1, path2) {
        let loader = new THREE.ObjectLoader();
        loader.load(`/img/${path1}/${path2}.json`, obj => {
            obj.scale.set(5, 5, 5);
            for (let key in obj.children) {
                objects.push(obj.children[key]);
                obj.children[key].callback = function() {
                    var a = new Audio('/sfx/goat.mp3');
                    a.play();
                };
            }
            this.shape = obj;
            scene.add(obj);
            obj.position.set(this.pos.x, this.pos.y, this.pos.z);
        });
    }
}

class Villager extends AI {
    constructor(pos) {
        super(pos, 5, 0, 5, -2, 'jason', 0);
        this.load('villager', 'villager');
    }
    loop() {
        return 'JSON "Jason" Sanchoooo';
    }
}

class Harambe extends AI {
    constructor(pos) {
        super(pos, 99999999, 999999999, 99999999999, 0, 'Harambe', 0);
    }
    loop() {
        return 'Harambe';
    }
}

class Gooblin extends AI {
    constructor(pos) {
        super(pos, 10, 3, -10, 10, 'Gooblin', 0);
    }
    loop() {
        return 'Gooblin';
    }
}
// :D  \/
class MusicGoat extends AI {
    constructor(pos) {
        super(pos, 5, 1, 100, 0, "Goatee, The Music Goat", Math.Infinity) // ∞
        this.load('fox', 'fox');
    }
    loop() {
        return 'MusicGoat';
    }
 }

class Orc extends AI {
    constructor(pos) {
        super(pos, 20, 7, -20, 30, 'Orc', 0);
    }
    loop() {
        return 'Orc';
    }
 }