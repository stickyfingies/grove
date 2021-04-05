/*!
 * 
 * Made with <3 by the Grove team | Mon Apr 05 2021 14:14:09 GMT-0500 (Central Daylight Time)
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
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/graphicsworker.ts":
/*!**********************************!*\
  !*** ./src/js/graphicsworker.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\r\nconst camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(45, 2, 0.01, 2000);\r\nconst scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\r\nlet renderer;\r\nconst idToEntity = new Map();\r\nconst cameraID = 0;\r\n// let geometryCache = {};\r\nconst textureCache = {};\r\nconst init = (data) => {\r\n    const { canvas, buffer, width, height, pixelRatio, } = data;\r\n    const tArr = new Float32Array(buffer);\r\n    const context = canvas.getContext('webgl2', { antialias: true });\r\n    renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({\r\n        canvas,\r\n        context,\r\n        antialias: true,\r\n    });\r\n    renderer.setClearColor(0x000000);\r\n    renderer.setSize(width, height, false);\r\n    renderer.setPixelRatio(pixelRatio);\r\n    renderer.shadowMap.enabled = true;\r\n    camera.aspect = width / height;\r\n    camera.updateProjectionMatrix();\r\n    scene.add(camera);\r\n    idToEntity.set(cameraID, camera);\r\n    const cube = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(6, 6, 6), new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({\r\n        color: 0xff0000,\r\n    }));\r\n    cube.position.y = 30;\r\n    scene.add(cube);\r\n    const light = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight(0xffffff, 1);\r\n    light.position.set(10, 30, -20);\r\n    light.castShadow = true;\r\n    const { shadow } = light;\r\n    shadow.camera.left = -1024;\r\n    shadow.camera.right = 1024;\r\n    shadow.camera.top = 1024;\r\n    shadow.camera.bottom = -1024;\r\n    shadow.mapSize.width = 1024;\r\n    shadow.mapSize.height = 1024;\r\n    scene.add(light);\r\n    const imagePrefix = '/img/skybox/';\r\n    const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];\r\n    const imageSuffix = '.jpg';\r\n    const skyGeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(2000, 2000, 2000);\r\n    const materialArray = [];\r\n    const loader = new three__WEBPACK_IMPORTED_MODULE_0__.ImageBitmapLoader();\r\n    loader.setOptions({\r\n        imageOrientation: 'flipY',\r\n    });\r\n    for (let i = 0; i < 6; i++) {\r\n        loader.load(imagePrefix + directions[i] + imageSuffix, (image) => {\r\n            const map = new three__WEBPACK_IMPORTED_MODULE_0__.CanvasTexture(image);\r\n            const mat = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({\r\n                map,\r\n                side: three__WEBPACK_IMPORTED_MODULE_0__.BackSide,\r\n                fog: false,\r\n            });\r\n            materialArray[i] = mat;\r\n        });\r\n    }\r\n    const skybox = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(skyGeometry, materialArray);\r\n    scene.add(skybox);\r\n    const render = () => {\r\n        cube.rotateY(0.01);\r\n        skybox.rotateY(0.0001);\r\n        // copy transforms from transform buffer\r\n        idToEntity.forEach((object, id) => {\r\n            const offset = Number(id) * 10;\r\n            object.position.copy(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(tArr[offset + 0], tArr[offset + 1], tArr[offset + 2]));\r\n            // eslint-disable-next-line max-len\r\n            object.quaternion.copy(new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion(tArr[offset + 3], tArr[offset + 4], tArr[offset + 5], tArr[offset + 6]));\r\n            /**\r\n             * Scale sometimes resolves as 0, causing ThreeJS issues.\r\n             * todo: figure out why this happens.  for now, ignore scale\r\n             */\r\n            // object.scale.copy(new Vector3(tArr[offset + 7], tArr[offset + 8], tArr[offset + 9]));\r\n        });\r\n        skybox.position.copy(camera.position);\r\n        renderer.render(scene, camera);\r\n        requestAnimationFrame(render);\r\n    };\r\n    render();\r\n};\r\nconst uploadTexture = ({ imageName, imageData, imageWidth, imageHeight, }) => {\r\n    if (textureCache[imageName])\r\n        return;\r\n    const map = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(imageData, imageWidth, imageHeight, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);\r\n    map.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\r\n    map.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\r\n    map.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;\r\n    map.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearMipMapLinearFilter;\r\n    map.generateMipmaps = true;\r\n    map.needsUpdate = true;\r\n    textureCache[imageName] = map;\r\n};\r\nconst addObject = ({ geometry, imageName, id }) => {\r\n    const shallowGeometry = geometry;\r\n    const buffergeo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();\r\n    Object.keys(shallowGeometry.attributes).forEach((attributeName) => {\r\n        const shallowAttribute = shallowGeometry.attributes[attributeName];\r\n        const attribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(shallowAttribute.array, shallowAttribute.itemSize, false);\r\n        buffergeo.addAttribute(attributeName, attribute);\r\n    });\r\n    const mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(buffergeo, new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial());\r\n    if (imageName)\r\n        mesh.material.map = textureCache[imageName];\r\n    mesh.castShadow = true;\r\n    mesh.receiveShadow = true;\r\n    scene.add(mesh);\r\n    idToEntity.set(id, mesh);\r\n};\r\nconst removeObject = ({ id }) => {\r\n    const object = idToEntity.get(id);\r\n    idToEntity.delete(id);\r\n    scene.remove(object);\r\n};\r\nconst resize = ({ width, height }) => {\r\n    camera.aspect = width / height;\r\n    camera.updateProjectionMatrix();\r\n    renderer.setSize(width, height, false);\r\n};\r\nconst messageHandlers = {\r\n    init,\r\n    uploadTexture,\r\n    addObject,\r\n    removeObject,\r\n    resize,\r\n};\r\nonmessage = ({ data }) => {\r\n    const { type } = data;\r\n    if (messageHandlers[type])\r\n        messageHandlers[type](data);\r\n    else\r\n        console.error(`no graphics handler registered for ${type}`);\r\n};\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/graphicsworker.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_three_build_three_module_js"], () => (__webpack_require__("./src/js/graphicsworker.ts")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					result = fn();
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + "9215fdd4ebce1ad49792" + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_js_graphicsworker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_three_build_three_module_js").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;