import $ from 'jquery';

const toggleFullScreen = () => {
  document.body.requestFullscreen();
};

export default () => {
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

    const pointerlockerror = () => { };

    document.addEventListener('pointerlockchange', pointerlockchange);
    document.addEventListener('mozpointerlockchange', pointerlockchange);
    document.addEventListener('webkitpointerlockchange', pointerlockchange);

    document.addEventListener('pointerlockerror', pointerlockerror);
    document.addEventListener('mozpointerlockerror', pointerlockerror);
    document.addEventListener('webkitpointerlockerror', pointerlockerror);

    const click = () => {
      toggleFullScreen();
      element.requestPointerLock();
    };

    const playButton = document.getElementsByClassName('play-btn')[0] as HTMLElement;
    playButton.onclick = click;
  } else {
    console.error('HTML5 PointerLock API is not supported');
  }
};
