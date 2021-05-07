import GameScript from '../script';

export default class PauseMenuScript extends GameScript {
  // eslint-disable-next-line class-methods-use-this
  init() {
    const pointerlockchange = () => {
      const isLocked = (document.pointerLockElement === document.body);
      this.engine.running = isLocked;

      document.querySelector('#pause')?.setAttribute('style', isLocked ? 'display:none' : 'display:block');

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
