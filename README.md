# **The Grove**

This game is the longest hobby project I ever have - and likely ever will - have worked on.  Born in 2017 as a browser-based RPG akin to TESV: Skyrim, the game has been rebuilt from the ground-up several times over the years, and now is a sort of sandbox for testing new web technologies and applying them in a game context.

> I encourage you to explore the [Software Architecture](#chapter-1), and then familiarize yourself with the [Technologies](#chapter-2).  The [Instructions](#chapter-3) can help you build the game on your PC.

## **Software Architecture** <a name="chapter-1"></a>

- **ECS**: All game objects ("entities") and their behaviors are logically represented using the [ECS paradigm](https://en.wikipedia.org/wiki/Entity_component_system).  Yeah, the game runs on Javascript and the performance benefits of this are negligable.  On the flip side, building this system has taught me a lot about cache locality and some of the architectural benefits of composition-over-inheritance.
- **Graphics**: This game uses [Three.js](https://github.com/mrdoob/three.js) to both order game objects into a heirarchical scene graph _(main thread)_, and then draw those objects _(render thread)_.  Every frame, the main thread computes individual object transforms, and communicates them to the render thread using [shared memory](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), which uses WebGL to draw the objects.
- **Physics**: Similarly to the renderer, ~~a WASM copy of~~ the Bullet physics engine sits on its own thread and churns out object transforms to the main thread using shared memory.  All memory is write-once read-many, so data races _shouldn't_ (!!!) occur.  I really don't know if offloading major systems like this increases performance by any considerable margin; but again, it was fun for a learning excersize.
- **Engine**: This package wraps together the ECS world, graphics sub-engine, and physics sub-engine, and gets
them all talking to eachother.  It also includes utilities for logging, asset loading (glTF), scene setup, and more.
- **Grove**: This is where all the actualy game code lives.  Every entity behavior is represented as a GameScript,
and so we can use GameScripts to decide what actually happens in the sumulation.  There are GameScripts for the player,
for the camera, for enemies and health bars, and basically everything which exists in the world.

## **Technologies** <a name="chapter-2"></a>

> Click any of the fancy badges to open that technology's website.

| Website | Description | Install |
|------:|-------|---
| [![Node.js](https://shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/dist/latest-v18.x/docs/api/synopsis.html) | "Cross-platform JavaScript runtime environment." | ✓ |
| [![Yarn](https://shields.io/badge/Yarn-FFFFFF?style=flat-square&logo=yarn&logoColor=2C8EBB)](https://yarnpkg.com/getting-started/usage) | "A package manager that doubles as project manager." | ✓ |
| [![TypeScript](https://shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=FFFFFF)](https://www.typescriptlang.org/) | "TypeScript is JavaScript with syntax for types." | ✗ |
| ![Three.js](https://shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=FFFFFF) | Spatial math and 3D rendering on the GPU via WebGL. | ✗ |
| ![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=flat-square&logo=vite&logoColor=yellow) | A build tool that powerfully combines all our source files. | ✗  |
| ![Electron](https://shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=FFFFFF) | "Enables web developers to make desktop applications." | ✗

## **Instructions** <a name="chapter-3"></a>

> This section requires a basic familiarity with computer terminal emulator programs, like `cmd.exe` on Windows.


<details>
<summary><b>(1) — Prerequisites</b></summary>

All of the development tools use a JavaScript engine called `Node`, and its package manager, `npm`.  Together, these tools allow developers to organize, test, and distribute their software projects.

1. Install [Node.js](https://nodejs.org/en) from the website.

My code uses `Yarn`, an alternative package manager with cool features for managing large projects.  The following command will enable `Yarn` on your machine.

```sh
$ corepack enable  # gain access to Yarn
```
To demonstrate the power of these package managers, we can install all the rest of the software tools you'll use with one fell swoop:
```sh
$ yarn install     # install *literally* everything else
```

</details>

---

<details>
<summary><b>(2) — Running / Editing the Game</b></summary>

Running the following command starts the game in development mode.

```sh
$ yarn dev  # launch Vite dev server and serve electron app
```

The game's source code files are found in `grove/src/game/`, and you can change them to see the game update in real-time.

The Grove uses the [Vite](https://vitejs.dev/guide/features.html#hot-module-replacement) build tool, which supports _hot module reloading_.  This means any changes you make to the code will automatically transfer to the electron app - no refresh required.

</details>

---

<details>
<summary><b>(3) — Building</b></summary>

Run the following command to bundle the entire game up into a package.  The resulting binaries + distributables will be in the `out/` directory.

```sh
$ yarn build    # bundle source files
```

</details>

---

## **License**

- The Grove is copyright 2022 by Hybrid Alpaca Game Studios. All images¹, story, and game are copyright of Hybrid Alapca Game Studios. Copying or redistributing this game or content without the consent of Hybrid Alpaca Game Studios is illegal and unlawful.

 - ¹ Most images are not owned by Hybrid Alpaca Game Studios.
 
## **Contributors**

- Seth Traman:              Lead Developer, CEO Hybrid Alapca Game Studios
- Nate Goldsborough:        Developer, Marketing, General Maintenance, CEO Artifex Inc.
- Casimir Kash:             Developer, Graphics, Beta Testing
- Hunter Sokolis:           Developer, Graphics, Humor Support
- Gavin Montheye:           PR
- KJ Avakian:               Developer
- Jasper Burns:             Storyline
- William VanDerLaan:       Beta Testing, Logos