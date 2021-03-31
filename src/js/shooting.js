"use strict";

import {ball} from "./load";

import {Ray, Vector3} from "three";

import { getEntity } from "./entities";
import { getCamera } from "./graphics";

export default (globals, player) => {
    // let sword;
    // let weapon;

    // loadModel("/models/sword/sword.json", object => {
    //     sword = object;
    //     sword.scale.set(0.1, 0.1, 0.1);
    //     sword.castShadow = true;
    //     sword.position.x++;
    //     sword.position.y -= 1.2;
    //     sword.position.z -= 1.25;
    // });

    // const addWeapon = () => {
    //     if (player.hotbar.list[player.hotbar.selected - 1]) player.equipped.weapon = player.hotbar.list[player.hotbar.selected - 1];
    //     if (player.equipped.weapon && /sword/gi.test(player.equipped.weapon.name) && !weapon) {
    //         weapon = sword.clone();
    //         getCamera().add(weapon);
    //         window.addEventListener('mousedown', () => {
    //             if (weapon) {
    //                 let tween = new TWEEN.Tween(weapon.rotation)
    //                     .to({
    //                         x: [-Math.PI / 2, 0]
    //                     }, 1 / (player.equipped.weapon.spd * 3000))
    //                     .onStart(() => {
    //                         let a = new Audio('/audio/sword.mp3');
    //                         a.play();
    //                     })
    //                     .start();

    //                 globals.TWEENS.push(tween);
    //             }
    //         });
    //     }
    //     else if (!player.equipped.weapon) {
    //         getCamera().remove(weapon);
    //         weapon = null;
    //     }
    // }

    const getShootDir = (targetVec) => {
        let playerent = getEntity(0);
        let vector = targetVec;
        targetVec.set(0, 0, 1);
        vector.unproject(getCamera());
        let ray = new Ray(playerent.body.position, vector.sub(playerent.body.position).normalize());
        targetVec.copy(ray.direction);
    }

    const shoot = () => {
        if (globals.controls.enabled == true && player.equipped) {

            let shootDirection = new Vector3();
            const shootVelo = 20;

            let playerent = getEntity(0)
            let x = playerent.body.position.x;
            let y = playerent.body.position.y;
            let z = playerent.body.position.z;

            let b = ball({
                c: player.equipped == 'rock' ? 0xCCCCCC : 0xFF4500
            }, globals);

            getShootDir(shootDirection);
            b.body.velocity.set(
                shootDirection.x * shootVelo,
                shootDirection.y * shootVelo,
                shootDirection.z * shootVelo);

            // Move the ball outside the player sphere
            x += shootDirection.x * (playerent.shape.radius * 1.02 + b.shape.radius);
            y += shootDirection.y * (playerent.shape.radius * 1.02 + b.shape.radius);
            z += shootDirection.z * (playerent.shape.radius * 1.02 + b.shape.radius);
            b.body.position.set(x, y, z);
            b.mesh.position.set(x, y, z);
            b.id = Math.random();

            b.body.addEventListener("collide", () => {
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

    // setInterval(addWeapon, 500);

    $(document).on('mousedown', shoot);

    // $(window).on('keydown', event => {
    //     try {
    //         let n = Number(String.fromCharCode(event.keyCode));
    //         if (typeof n == 'number' && !isNaN(n) && n >= 1 && n <= 8) {
    //             player.hotbar.selected = n;
    //             if (player.hotbar.list[n - 1]) player.equipped.weapon = player.hotbar.list[n - 1];
    //             else player.equipped.weapon = null;
    //         }
    //     }
    //     catch (err) {}
    // });
};
