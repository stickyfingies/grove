# **The Grove**

![Vite](https://a11ybadges.com/badge?logo=vite)
![TypeScript](https://a11ybadges.com/badge?logo=typescript)
![Three.js](https://a11ybadges.com/badge?logo=threedotjs)
![Electron](https://a11ybadges.com/badge?logo=electron)

This game is the longest hobby project I ever have - and likely ever will - have worked on.  Born in 2017 as a browser-based RPG akin to TESV: Skyrim, the game has been rebuilt from the ground-up several times over the years, and now is a sort of sandbox for testing new web technologies and applying them in a game context.

## **Features**

- **Composited Entity Model**: All game objects ("entities") and their behaviors are logically represented using the [ECS paradigm](https://en.wikipedia.org/wiki/Entity_component_system).  Yeah, the game runs on Javascript and the performance benefits of this are negligable.  On the flip side, building this system has taught me a lot about cache locality and some of the architectural benefits of composition-over-inheritance.
- **Multi-threaded Rendering**: This game uses [Three.js](https://github.com/mrdoob/three.js) to both order game objects into a heirarchical scene graph _(main thread)_, and then draw those objects _(render thread)_.  Every frame, the main thread computes individual object transforms, and communicates them to the render thread using [shared memory](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), where objects are drawn in their correct places.
- **Multi-threaded Physics**: Similarly to the renderer, ~~a WASM copy of~~ the Bullet physics engine sits on its own thread and churns out object transforms to the main thread using shared memory.  All memory is write-once read-many, so data races _shouldn't_ (!!!) occur.  I really don't know if offloading major systems like this increases performance by any considerable margin; but again, it was fun for a learning excersize.

## **Building**

These instructions assume you use the Yarn package manager.  If you elect to use NPM instead, replace all instances of `yarn` with `npm run`.

### ▻ **Developing the App**

```sh
$ yarn dev            # launch Vite dev server and serve electron app
```

The Grove uses the [Vite](https://vitejs.dev/guide/features.html#hot-module-replacement) build tool, which supports _hot module reloading_.  This means any changes you make to the code will automatically transfer to the electron app - no refresh required.


### ▻ **Building for Production**

```sh
$ yarn build          # bundle source files
$ yarn electron:build # package electron app + make distributable binaries
```

The resulting binaries + distributables will be in the `out/` directory.

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