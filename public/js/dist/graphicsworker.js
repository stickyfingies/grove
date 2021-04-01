/*!
 * 
 * Made with <3 by the Grove team | Thu Apr 01 2021 01:33:42 GMT+0000 (Coordinated Universal Time)
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
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["graphicsworker"],{

/***/ "./src/js/graphicsworker.js":
/*!**********************************!*\
  !*** ./src/js/graphicsworker.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"uploadTexture\": () => (/* binding */ uploadTexture)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cannon-es */ \"./node_modules/cannon-es/dist/cannon-es.js\");\n\n\n\n\n\nlet camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(45, 2, 0.01, 2000);\nlet scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\n\n/**\n * map from id -> object\n * automatically copy transform from buffer @ id\n */\n\nlet entityMap = [];\nlet entityId = 0;\n\nlet geometryCache = {};\nlet textureCache = {};\n\nconst init = (data) => {\n    const { canvas, buffer, width, height, pixelRatio } = data;\n\n    // this is our array of object transforms.\n    // currently, it only contains the camera\n    let tArr = new Float32Array(buffer);\n\n    let context = canvas.getContext(\"webgl2\", { antialias: true });\n\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({\n        canvas,\n        context,\n        antialias: true\n    });\n    renderer.setClearColor(0x000000);\n    renderer.setSize(width, height, false);\n    renderer.setPixelRatio(pixelRatio);\n    renderer.shadowMap.enabled = true;\n\n    camera.aspect = width / height;\n    camera.updateProjectionMatrix();\n    entityMap[entityId++] = camera;\n    scene.add(camera);\n\n    let light = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight(0xffffff, 1);\n    light.position.set(0, 30, 20);\n    light.castShadow = true;\n    light.shadowMapBias = 0.0036;\n    light.shadowMapDarkness = 0.5;\n    let { shadow } = light;\n    shadow.camera.fov = 70;\n    shadow.camera.left = -1024;\n    shadow.camera.right = 1024;\n    shadow.camera.top = 1024;\n    shadow.camera.bottom = -1024;\n    shadow.mapSize.width = 1024;\n    shadow.mapSize.height = 1024;\n\n    scene.add(light);\n\n    let imagePrefix = \"/img/skybox/\";\n    let directions = [\"px\", \"nx\", \"py\", \"ny\", \"pz\", \"nz\"];\n    let imageSuffix = \".jpg\";\n    let skyGeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(2000, 2000, 2000);\n\n    let skybox = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();\n    let materialArray = [];\n    let loader = new three__WEBPACK_IMPORTED_MODULE_0__.ImageBitmapLoader();\n    loader.setOptions({\n        imageOrientation: \"flipY\"\n    });\n    for (let i = 0; i < 6; i++) {\n        loader.load(imagePrefix + directions[i] + imageSuffix, image => {\n            const map = new three__WEBPACK_IMPORTED_MODULE_0__.CanvasTexture(image);\n            const mat = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({\n                map,\n                side: three__WEBPACK_IMPORTED_MODULE_0__.BackSide,\n                fog: false\n            });\n            materialArray[i] = mat;\n\n            // this if condition is true more than once (why?)\n            if (materialArray.length == 6 && !skybox.material) {\n                skybox = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(skyGeometry, materialArray);\n                scene.add(skybox);\n            }\n        });\n    }\n\n    const render = () => {\n        for (let id in entityMap) {\n            let object = entityMap[id];\n            const offset = id * 10;\n            object.position.copy(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(tArr[offset + 0], tArr[offset + 1], tArr[offset + 2]));\n            object.quaternion.copy(new cannon_es__WEBPACK_IMPORTED_MODULE_1__.Quaternion(tArr[offset + 3], tArr[offset + 4], tArr[offset + 5], tArr[offset + 6]));\n            // object.scale.copy(new Vector3(tArr[offset + 7], tArr[offset + 8], tArr[offset + 9]));\n\n            // something about scale is reporting values of 0,0,0 for entities 1-15\n            // it's causing three to spit out a bunch of warnings and frankly, i don't\n            // have the energy to fix it.  so for now, we don't apply scales\n        }\n\n        skybox.position.copy(camera.position);\n\n        renderer.render(scene, camera);\n\n        requestAnimationFrame(render);\n    }\n\n    render();\n};\n\nconst uploadTexture = ({ imageName, imageData, imageWidth, imageHeight }) => {\n    if (textureCache[imageName]) return;\n\n    let map = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(imageData, imageWidth, imageHeight, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);\n    map.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;\n    map.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearMipMapLinearFilter;\n    map.generateMipmaps = true;\n    map.needsUpdate = true;\n\n    textureCache[imageName] = map;\n};\n\nconst addObject = ({ geometry, imageName }) => {\n    const shallowGeometry = geometry;\n    const buffergeo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();\n\n    for (let attributeName of Object.keys(shallowGeometry.attributes)) {\n        const shallowAttribute = shallowGeometry.attributes[attributeName];\n        const attribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(\n            shallowAttribute.array,\n            shallowAttribute.itemSize,\n            false\n        );\n        buffergeo.addAttribute(attributeName, attribute);\n    }\n\n    const mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(buffergeo, new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial());\n    if (imageName) mesh.material.map = textureCache[imageName];\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    scene.add(mesh);\n\n    entityMap[entityId++] = mesh;\n};\n\nconst messageHandlers = {\n    init,\n    uploadTexture,\n    addObject\n};\n\nself.onmessage = ({ data }) => {\n    const { type } = data;\n    if (messageHandlers[type]) messageHandlers[type](data);\n    else console.error(\"no graphics handler registered for \" + type);\n};\n\n//# sourceURL=webpack://the-grove/./src/js/graphicsworker.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__("./src/js/graphicsworker.js")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);