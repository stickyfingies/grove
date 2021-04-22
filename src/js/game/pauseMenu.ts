import $ from 'jquery';
import GameScript from '../script';

export default class PauseMenuScript extends GameScript {
  init() {
    const blocker = document.getElementById('blocker')!;

    const pointerlockchange = () => {
      const isLocked = (document.pointerLockElement === document.body);
      this.engine.running = isLocked;

      $('#pause').toggle(!isLocked);
      if (isLocked) {
        blocker.style.display = 'none';
      }
    };

    document.addEventListener('pointerlockchange', pointerlockchange);

    const click = () => {
      document.body.requestFullscreen();
      document.body.requestPointerLock();
    };

    $('.play-btn').on('click', click);
  }
}
