export default (globals) => {
    let blocker = document.getElementById('blocker');
    let hud = document.getElementById('hud');

    const havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if (havePointerLock) {

        let element = document.body;

        let pointerlockchange = () => {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                globals.controls.enabled = true;
                blocker.style.display = 'none';
                $('#pause').hide();
                hud.style.display = '';
            }
            else {
                globals.controls.enabled = false;
                hud.style.display = 'none';
                $('#pause').show();

                // blocker.style.display = '-webkit-box';
                // blocker.style.display = '-moz-box';
                // blocker.style.display = 'box';

                // instructions.style.display = '';
            }
        }

        const pointerlockerror = () => { }

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        function click() {
            toggleFullScreen();

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            element.requestPointerLock();
        }

        document.getElementsByClassName("play-btn")[0].onclick = click;
    }
    else {
        alert('Your browser doesn\'t support the HTML5 PointerLock API!');
    }

    function toggleFullScreen() {
        let i = document.body;
        // go full-screen
        if (i.requestFullscreen) {
            i.requestFullscreen();
        }
        else if (i.webkitRequestFullscreen) {
            i.webkitRequestFullscreen();
        }
        else if (i.mozRequestFullScreen) {
            i.mozRequestFullScreen();
        }
        else if (i.msRequestFullscreen) {
            i.msRequestFullscreen();
        }
    }
}