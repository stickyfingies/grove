"use strict";

import {ball, loadModel} from "./load";

import {Raycaster, Ray, Vector3} from "three";

export default (globals, player) => {
    let sword;
    let weapon;

    loadModel("/models/sword/sword.json", object => {
        sword = object;
        sword.scale.set(0.1, 0.1, 0.1);
        sword.castShadow = true;
        sword.position.x++;
        sword.position.y -= 1.2;
        sword.position.z -= 1.25;
    });

    const addWeapon = () => {
        if (player.hotbar.list[player.hotbar.selected - 1]) player.equipped.weapon = player.hotbar.list[player.hotbar.selected - 1];
        if (player.equipped.weapon && /sword/gi.test(player.equipped.weapon.name) && !weapon) {
            weapon = sword.clone();
            globals.camera.add(weapon);
            window.addEventListener('mousedown', () => {
                if (weapon) {
                    let tween = new TWEEN.Tween(weapon.rotation)
                        .to({
                            x: [-Math.PI / 2, 0]
                        }, 1 / (player.equipped.weapon.spd * 3000))
                        .onStart(() => {
                            let a = new Audio('/audio/sword.mp3');
                            a.play();
                        })
                        .start();

                    globals.TWEENS.push(tween);

                    let raycaster = new Raycaster();
                    raycaster.set(globals.camera.getWorldPosition(), globals.camera.getWorldDirection(new Vector3(0, 0, -1)));
                    let intersects = raycaster.intersectObjects(globals.scene.children, true);
                    if (intersects.length && intersects[0].object.name == 'rabbit') Materialize.toast('Got one!', 750);
                    else if (intersects.length && intersects[0].object.name == 'Rabbit') Materialize.toast('Still unchanged.  Solution coming!', 750);
                }
            });
        }
        else if (!player.equipped.weapon) {
            globals.camera.remove(weapon);
            weapon = null;
        }
    }

    const getShootDir = (targetVec) => {
        let vector = targetVec;
        targetVec.set(0, 0, 1);
        vector.unproject(globals.camera);
        let ray = new Ray(globals.BODIES['player'].body.position, vector.sub(globals.BODIES['player'].body.position).normalize());
        targetVec.copy(ray.direction);
    }

    const shoot = () => {
        if (globals.controls.enabled == true && player.equipped) {

            let shootDirection = new Vector3();
            const shootVelo = 20;

            let x = globals.BODIES['player'].body.position.x;
            let y = globals.BODIES['player'].body.position.y;
            let z = globals.BODIES['player'].body.position.z;

            let b = ball({
                array: 'projectiles',
                c: player.equipped == 'rock' ? 0xCCCCCC : 0xFF4500
            }, globals);

            getShootDir(shootDirection);
            b.body.velocity.set(
                shootDirection.x * shootVelo,
                shootDirection.y * shootVelo,
                shootDirection.z * shootVelo);

            // Move the ball outside the player sphere
            x += shootDirection.x * (globals.BODIES['player'].shape.radius * 1.02 + b.shape.radius);
            y += shootDirection.y * (globals.BODIES['player'].shape.radius * 1.02 + b.shape.radius);
            z += shootDirection.z * (globals.BODIES['player'].shape.radius * 1.02 + b.shape.radius);
            b.body.position.set(x, y, z);
            b.mesh.position.set(x, y, z);
            b.id = Math.random();

            b.body.addEventListener("collide", (event) => {
                const contact = event.contact;
                if (contact.bj.id != b.body.id)
                    for (let key in globals.PLAYERS) {
                        if (contact.bj == globals.PLAYERS[key].body)
                            globals.socket.emit('hit-player', globals.PLAYERS[key].id);
                    }
                setTimeout(() => {
                    globals.remove.bodies.push(b.body);
                    globals.remove.meshes.push(b.mesh);
                }, 1500);

            });

            globals.socket.emit('bullet', {
                pos: {x, y, z},
                vel: {
                    x: b.body.velocity.x,
                    y: b.body.velocity.y,
                    z: b.body.velocity.z
                },
            });
        }
    }

    setInterval(addWeapon, 500);

    $(document).on('mousedown', shoot);

    $(window).on('keydown', event => {
        if (String.fromCharCode(event.keyCode) == 'E') {
            let raycaster = new Raycaster();
            raycaster.set(globals.camera.getWorldPosition(), globals.camera.getWorldDirection(new Vector3(0, 0, -1)));
            let intersects = raycaster.intersectObjects(globals.scene.children, true);
            if (intersects.length > 0) {
                if (/door/gi.test(intersects[0].object.name)) globals.socket.emit('map-update', {
                    username: player.serverdata.acc.username,
                    password: player.serverdata.acc.password,
                    map: 'skjar-isles'
                });
            }
        }
        try {
            let n = Number(String.fromCharCode(event.keyCode));
            if (typeof n == 'number' && !isNaN(n) && n >= 1 && n <= 8) {
                player.hotbar.selected = n;
                if (player.hotbar.list[n - 1]) player.equipped.weapon = player.hotbar.list[n - 1];
                else player.equipped.weapon = null;
            }
        }
        catch (err) {}
    });
};
