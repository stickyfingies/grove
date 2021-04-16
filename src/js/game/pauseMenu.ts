import $ from 'jquery';

// eslint-disable-next-line import/prefer-default-export
export const init = (engineData: any) => {
  const blocker = document.getElementById('blocker')!;

  const pointerlockchange = () => {
    const isLocked = (document.pointerLockElement === document.body);
    engineData.running = isLocked;

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
