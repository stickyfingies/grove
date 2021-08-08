import GameScript from '../script';

export default class PauseMenuScript extends GameScript {
    // eslint-disable-next-line class-methods-use-this
    init() {
        const pointerlockchange = () => {
            const isLocked = (document.pointerLockElement === document.body);

            // actually pause game simulation
            this.engine.running = isLocked;

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
