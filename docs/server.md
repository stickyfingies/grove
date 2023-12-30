# Server (web API)

The Grove engine comes with a builtin REST api, for communicating with live running instances of the game.

### Overview

The server is hosted at `localhost:3333`, and messages are sent to the engine by GET-ing the message name as a path.  So, for a working example, visiting the URL `localhost:3333/slime` will send a "slime" message to the engine, which as of today (June 01 2022) causes a slime to spawn in-game.

### TypeScript API

```ts
function do_thing() {
    // this code runs when localhost:3333/FOO is reached
    console.warn('unleashing the foo');
}
// @ts-ignore
window.webApi.onmessage('FOO', do_thing);
```