import $ from 'jquery';

const toggleFullScreen = () => {
  document.body.requestFullscreen();
};

export default (engineData: any) => {
  const blocker = document.getElementById('blocker')!;
  const hud = document.getElementById('hud')!;

  const havePointerLock = 'pointerLockElement' in document;

  if (havePointerLock) {
    const element = document.body;

    const pointerlockchange = () => {
      if (document.pointerLockElement === element) {
        blocker.style.display = 'none';
        $('#pause').hide();
        hud.style.display = '';
      } else {
        hud.style.display = 'none';
        $('#pause').show();
      }
    };

    document.addEventListener('pointerlockchange', pointerlockchange);

    const click = () => {
      toggleFullScreen();
      element.requestPointerLock();
      engineData.running = true;
    };

    $('.play-btn').on('click', click);
  } else {
    console.error('HTML5 PointerLock API is not supported');
  }
};
