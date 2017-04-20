/* global THREE */

module.exports = (globals) => {

    // Current Required AIs Include: Wicket, Ferdinand, Nicholas Czerwinski

    class AI {
        constructor(name = '{{ AI CONSTRUCTOR }}', hp = 10, dmg = 10) {
            this.name = name;
            this.hp = hp;
            this.dmg = dmg;
            globals.AIS.push(this);
        }

        update() {} // virtual
    }

    class Animal extends AI {

        constructor(type = 'animal', hp = 3, dmg = 2, hostility = 0) {
            // Hostility: -1 is run away, 0 = neutral, 1 is hostile
            super(type, hp, dmg);
            let loader = new THREE.ObjectLoader();
            this.hostility = hostility;
            this.id = Math.random();
            loader.load(`/models/${type}/${type}.json`, object => {
                if (type == 'chicken') object.scale.set(5, 5, 5);
                let body = globals.ball({
                    radius: 0.4,
                    mass: 15,
                    pos: new THREE.Vector3(Math.random() * 50 - 25, 20, Math.random() * 50 - 25),
                    mesh: object,
                    norotate: true,
                    cb(body) {
                        body.mesh.name = 'rabbit';
                    }
                });
                this.body = body;
                setInterval(() => this.update(this.body, this.hostility), 40);
            });
        }

        update(body, hostility) {
            const ppos = globals.BODIES['player'].body.position;
            const bpos = body.body.position;
            if (globals.BODIES['player'].mesh.position.distanceTo(body.mesh.position) < 20) {
                let speed = 12.5;
                if (hostility < 0) speed *= -1;
                body.body.velocity.set(ppos.x < bpos.x ? -speed : speed, body.body.velocity.y, ppos.z < bpos.z ? -speed : speed);
                body.mesh.lookAt(globals.BODIES['player'].mesh.position);
            }
            else this.body.body.velocity.set(0, body.body.velocity.y, 0);
        }
    }

    // This should be good


    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);
    new Animal('rabbit', 3, 0, -1);

    /* new Animal('chicken', 1, 0, -0.5); // Needs to be a bit docile, but also be a bit afraid
     new Animal('chicken', 1, 0, -0.5);
     new Animal('chicken', 1, 0, -0.5);*/


};
