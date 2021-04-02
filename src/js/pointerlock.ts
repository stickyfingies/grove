"use strict";

import $ from "jquery";

export default () => {
    let blocker = document.getElementById("blocker")!;
    let hud = document.getElementById("hud")!;

    const havePointerLock = "pointerLockElement" in document;

    if (havePointerLock) {
        let element = document.body;

        const pointerlockchange = () => {
            if (document.pointerLockElement === element) {
                blocker.style.display = "none";
                $("#pause").hide();
                hud.style.display = "";
            }
            else {
                hud.style.display = "none";
                $("#pause").show();
            }
        }

        const pointerlockerror = () => { }

        document.addEventListener("pointerlockchange", pointerlockchange);
        document.addEventListener("mozpointerlockchange", pointerlockchange);
        document.addEventListener("webkitpointerlockchange", pointerlockchange);

        document.addEventListener("pointerlockerror", pointerlockerror);
        document.addEventListener("mozpointerlockerror", pointerlockerror);
        document.addEventListener("webkitpointerlockerror", pointerlockerror);

        const click = () => {
            toggleFullScreen();
            element.requestPointerLock();
        }

        let playButton = document.getElementsByClassName("play-btn")[0] as HTMLElement;
        playButton.onclick = click;
    }
    else {
        alert("Your browser doesn't support the HTML5 PointerLock API!");
    }

    function toggleFullScreen() {
        document.body.requestFullscreen();
    }
}