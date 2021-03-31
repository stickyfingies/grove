"use strict";

import initWorld from "./world";
import initPlayer from "./player";

export default (globals, player) => {
    initWorld(globals.world);
    initPlayer(globals, player);
}
