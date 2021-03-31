/*!
 * 
 * Made with <3 by the Grove team | Wed Mar 31 2021 04:56:57 GMT+0000 (Coordinated Universal Time)
 *
 */
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["graphics-worker"],{

/***/ "./src/js/graphics-worker.js":
/*!***********************************!*\
  !*** ./src/js/graphics-worker.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cannon-es */ \"./node_modules/cannon-es/dist/cannon-es.js\");\n\n\n\n\n\nlet camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(45, 2, 0.01, 10000);\nlet scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\n\nconst init = (data) => {\n    const { canvas, width, height, pixelRatio } = data;\n\n    // let context = canvas.getContext(\"webgl2\", { antialias: true });\n\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({\n        canvas,\n        // context,\n        antialias: true\n    });\n    renderer.setClearColor(0x000000);\n    renderer.setSize(width, height, false);\n    renderer.setPixelRatio(pixelRatio);\n\n    camera.aspect = width / height;\n    camera.updateProjectionMatrix();\n    scene.add(camera);\n\n    let light = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight(0xffffff, 1);\n    light.position.set(50, 30, 40);\n    light.castShadow = true;\n    light.shadowMapBias = 0.0036;\n    light.shadowMapDarkness = 0.5;\n    let { shadow } = light;\n    shadow.camera.fov = 70;\n    shadow.camera.left = -400;\n    shadow.camera.right = 400;\n    shadow.camera.top = 100;\n    shadow.camera.bottom = -300;\n    shadow.mapSize.width = 4096;\n    shadow.mapSize.height = 4096;\n\n    scene.add(light);\n\n    let imagePrefix = \"/img/skybox/\";\n    let directions = [\"px\", \"nx\", \"py\", \"ny\", \"pz\", \"nz\"];\n    let imageSuffix = \".jpg\";\n    let skyGeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(2000, 2000, 2000);\n\n    let materialArray = [];\n    let loader = new three__WEBPACK_IMPORTED_MODULE_0__.ImageBitmapLoader();\n    loader.setOptions({\n        imageOrientation: \"flipY\"\n    });\n    for (let i = 0; i < 6; i++) {\n        loader.load(imagePrefix + directions[i] + imageSuffix, image => {\n            const map = new three__WEBPACK_IMPORTED_MODULE_0__.CanvasTexture(image);\n            const mat = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({\n                map,\n                side: three__WEBPACK_IMPORTED_MODULE_0__.BackSide,\n                fog: false\n            });\n            materialArray[i] = mat;\n\n            if (materialArray.length == 6) {\n                let skyBox = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(skyGeometry, materialArray);\n                scene.add(skyBox);\n                scene.updateMatrixWorld();\n            }\n        });\n    }\n\n    const render = () => {\n        renderer.render(scene, camera);\n        requestAnimationFrame(render);\n    }\n\n    render();\n};\n\nconst updateCamera = ({ p, q, s }) => {\n    camera.position.copy(p);\n    camera.quaternion.copy(new cannon_es__WEBPACK_IMPORTED_MODULE_1__.Quaternion(q._x, q._y, q._z, q._w));\n    camera.scale.copy(s);\n};\n\nconst addObject = ({ geometry, imageData, imageWidth, imageHeight, p, q, s }) => {\n    const shallowGeometry = geometry;\n    const buffergeo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();\n\n    for (let attributeName of Object.keys(shallowGeometry.attributes)) {\n        const shallowAttribute = shallowGeometry.attributes[attributeName];\n        const attribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(\n            shallowAttribute.array,\n            shallowAttribute.itemSize,\n            false\n        );\n        buffergeo.addAttribute(attributeName, attribute);\n    }\n\n    buffergeo.groups = shallowGeometry.groups;\n\n    let map = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(imageData, imageWidth, imageHeight, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);\n    map.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;\n    map.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearMipMapLinearFilter;\n    map.generateMipmaps = true;\n    map.needsUpdate = true;\n    const mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(buffergeo, new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({\n        map\n    }));\n    mesh.position.copy(p);\n    mesh.quaternion.copy(new cannon_es__WEBPACK_IMPORTED_MODULE_1__.Quaternion(q._x, q._y, q._z, q._w));\n    mesh.scale.copy(s);\n    mesh.updateMatrix();\n    scene.add(mesh);\n};\n\nconst messageHandlers = {\n    init,\n    updateCamera,\n    addObject\n};\n\nself.onmessage = ({ data }) => {\n    const { type } = data;\n    if (messageHandlers[type]) messageHandlers[type](data);\n    else console.log(\"No handler registered for \" + type);\n};\n\n//# sourceURL=webpack://the-grove/./src/js/graphics-worker.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__("./src/js/graphics-worker.js")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);