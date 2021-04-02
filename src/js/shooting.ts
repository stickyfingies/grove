"use strict";

import { ball } from "./load";

import { Ray, Vector3 } from "three";
import $ from "jquery";
import { getEntity } from "./entities";
import { camera } from "./graphics";
import PointerLockControls from "./threex/pointerlockControls";

export default (globals: any, controls: PointerLockControls) => {
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

    const getShootDir = (targetVec: Vector3) => {
        let playerent = getEntity(0);
        let vector = targetVec;
        targetVec.set(0, 0, 1);
        vector.unproject(camera);
        let ray = new Ray(playerent.body.position, vector.sub(playerent.body.position).normalize());
        targetVec.copy(ray.direction);
    }

    const shoot = () => {
        if (!controls.isLocked) return;

        let b = ball({
            c: 0xFF4500
        }, globals);

        let shootDirection = new Vector3();
        getShootDir(shootDirection);
        const { x: sdx, y: sdy, z: sdz } = shootDirection;
        const shootVelo = 20;
        b.body.velocity.set(sdx * shootVelo, sdy * shootVelo, sdz * shootVelo);

        let playerent = getEntity(0);
        let { x, y, z } = playerent.body.position;

        x += shootDirection.x * (playerent.shape.radius * 1.02 + b.shape.radius);
        y += shootDirection.y * (playerent.shape.radius * 1.02 + b.shape.radius);
        z += shootDirection.z * (playerent.shape.radius * 1.02 + b.shape.radius);

        b.body.position.set(x, y, z);
        b.mesh.position.set(x, y, z);

        b.body.addEventListener("collide", () => {
            setTimeout(() => {
                globals.remove.bodies.push(b.body);
                // removeFromScene(b.mesh);
            }, 1500);
        });
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
