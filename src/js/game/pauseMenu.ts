import $ from 'jquery';
import Engine from '../engine';

// eslint-disable-next-line import/prefer-default-export
export const init = (engine: Engine) => {
  const blocker = document.getElementById('blocker')!;

  const pointerlockchange = () => {
    const isLocked = (document.pointerLockElement === document.body);
    engine.running = isLocked;

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
};
