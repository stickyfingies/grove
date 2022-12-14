# **3-AD**
    Library: Render three.js scenes in a parallel worker thread

![TypeScript](https://a11ybadges.com/badge?logo=typescript)
![Three.js](https://a11ybadges.com/badge?logo=threedotjs)

## Outline

The following is an example of the exact same demo program, set up with a multithreaded renderer and a singlethreaded renderer.  Both produce identical results, except the leftmost example runs in a different CPU core using `WebWorker` technology.

There are no benchmarks for this project yet, so it's not certain whether this is _actually_ faster for real-world graphical applications.  Though, in theory, it would out-perform a single-threaded approach if there were frequent user inputs or UI interactions.

This is the renderer used in [The Grove](https://github.com/stickyfingies/grove), a hobby RPG game made with web technologies. I made this library for it because ~~the game needed the performance~~ **I wanted to.**

<table>
<tr>
<td> <h2>3-AD (multi-threaded)</h2> </td> <td> <h2>THREE.js (single-threaded)</h2> </td>
</tr>
<tr>
<td>

```ts
import * as THREE from 'three';
import { Graphics } from '/lib/';

//////////
// init //
//////////
 
const graphics = new Graphics();
 
graphics.init();

/////////////////
// scene setup //
/////////////////
 
graphics.camera.position.z = 1;

const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
 
graphics.addObjectToScene(mesh);

///////////////
// animation //
///////////////

requestAnimationFrame(animate);

function animate(time) {

    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    graphics.update();

    requestAnimationFrame(animate);

}
```

</td>
<td>

```ts
import * as THREE from 'three';
 
//////////
// init //
//////////

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/////////////////
// scene setup //
/////////////////

const camera = new THREE.PerspectiveCamera();
camera.position.z = 1;

const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
 
scene.add(mesh);

///////////////
// animation //
///////////////

requestAnimationFrame(animate);

function animate(time) {

    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    renderer.render(scene, camera);

    requestAnimationFrame(animate);

}
```

</td>
</tr>
</table>

---

## **Platform Support**

3-AD uses two experimental browser features: `SharedArrayBuffer` and `module workers`.  _As far as I know_, Chromium is the only browser engine which supports both.  Certain [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes) are required for SharedArrayBuffer to become available, as well.

| Chromium | Firefox | WebKit |
| :------: | :-----: | :----: |
|   ✔️      | ❌      |  ❌     |

All platforms were tested on Arch Linux.  WebKit support was tested through WebKitGTK.

## **Building**

These instructions assume you use the Yarn package manager.  If you elect to use NPM instead, replace all instances of `yarn` with `npm run`.

### ▻ **Running the example**

Note: due to restrictions on `SharedArrayBuffer`, this example will only work on Chromium.  As a Firefox user, this does not bring me joy, but it's the _only_ way right now.

```sh
$ yarn          # fetch dependencies (only run once)
$ yarn dev      # launch example
```

### ▻ **Building for Production**

```sh
$ yarn build    # build library
$ yalc publish  # (optional) - publish to local repo
```

ℹ️ The resulting library and TypeScript definitions will be in the `dist/` directory.