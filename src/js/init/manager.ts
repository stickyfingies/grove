"use strict";

import initWorld from "./world";
import initPlayer from "./player";

export default (globals: any, player: any) => {
    initWorld(globals.world);
    initPlayer(globals, player);
}
