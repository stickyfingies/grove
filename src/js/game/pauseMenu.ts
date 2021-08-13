/**
 * This file is rather confusing, as it accomplishes a few tasks:
 * - 1), going fullscreen and locking the cursor when the play button is pressed
 * - 2), actually starting the core engine loop simultaneously with the above
 * - 3), showing and hiding the pause menu if the core loop is running or not, respectively
 *
 * This could be broken up much more nicely, like so:
 * - Player clicks the "play" button
 * - Script sends a message to the engine: "ayo slime, start the game"
 * - Engine's like "Gotchu ghee", starts the core loop, enters fullscreen
 *
 * Sometime later:
 * - Player presses escape
 * - "Uh oh", says the engine.  Pauses loop and sends "pause" event
 * - Script catches event, displays pause menu
 *
 * This approach sounds better to me because now, the nitty gritty pointerlock code
 * gets moved OUT of game script space, and into the engine internals where it really belongs.
 * Additionally, the "PauseMenuScript" only has to worry about the literal pause menu.  SOLID FTW!
 */

import GameScript from '../script';

export default class PauseMenuScript extends GameScript {
    init() {
        const pointerlockchange = () => {
            const isLocked = (document.pointerLockElement === document.body);

            if (isLocked) {
                this.engine.events.emit('start');
            } else {
                this.engine.events.emit('stop');
            }

            // toggle pause menu
            document.querySelector('#pause')?.setAttribute('style', `display:${isLocked ? 'none' : 'block'}`);

            // hide black screen when game starts
            if (isLocked) document.querySelector('#blocker')?.setAttribute('style', 'display:none');
        };

        document.addEventListener('pointerlockchange', pointerlockchange);

        const click = () => {
            document.body.requestFullscreen();
            document.body.requestPointerLock();
        };

        for (const btn of document.querySelectorAll('.play-btn')) btn.addEventListener('click', click);
    }
}
