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

/***/ "./src/js/graphics-worker.js":
/*!***********************************!*\
  !*** ./src/js/graphics-worker.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cannon-es */ \"./node_modules/cannon-es/dist/cannon-es.js\");\n\n\n\n\n\nlet camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(45, 2, 0.01, 10000);\nlet scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\n\nconst init = (data) => {\n    const { canvas, width, height, pixelRatio } = data;\n\n    // let context = canvas.getContext(\"webgl2\", { antialias: true });\n\n    const renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({\n        canvas,\n        // context,\n        antialias: true\n    });\n    renderer.setClearColor(0x000000);\n    renderer.setSize(width, height, false);\n    renderer.setPixelRatio(pixelRatio);\n\n    camera.aspect = width / height;\n    camera.updateProjectionMatrix();\n    scene.add(camera);\n\n    let light = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight(0xffffff, 1);\n    light.position.set(50, 30, 40);\n    light.castShadow = true;\n    light.shadowMapBias = 0.0036;\n    light.shadowMapDarkness = 0.5;\n    let { shadow } = light;\n    shadow.camera.fov = 70;\n    shadow.camera.left = -400;\n    shadow.camera.right = 400;\n    shadow.camera.top = 100;\n    shadow.camera.bottom = -300;\n    shadow.mapSize.width = 4096;\n    shadow.mapSize.height = 4096;\n\n    scene.add(light);\n\n    let imagePrefix = \"/img/skybox/\";\n    let directions = [\"px\", \"nx\", \"py\", \"ny\", \"pz\", \"nz\"];\n    let imageSuffix = \".jpg\";\n    let skyGeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(2000, 2000, 2000);\n\n    let materialArray = [];\n    let loader = new three__WEBPACK_IMPORTED_MODULE_0__.ImageBitmapLoader();\n    loader.setOptions({\n        imageOrientation: \"flipY\"\n    });\n    for (let i = 0; i < 6; i++) {\n        loader.load(imagePrefix + directions[i] + imageSuffix, image => {\n            const map = new three__WEBPACK_IMPORTED_MODULE_0__.CanvasTexture(image);\n            const mat = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({\n                map,\n                side: three__WEBPACK_IMPORTED_MODULE_0__.BackSide,\n                fog: false\n            });\n            materialArray[i] = mat;\n\n            if (materialArray.length == 6) {\n                let skyBox = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(skyGeometry, materialArray);\n                scene.add(skyBox);\n            }\n        });\n    }\n\n    const render = () => {\n        renderer.render(scene, camera);\n        requestAnimationFrame(render);\n    }\n\n    render();\n};\n\nconst updateCamera = ({ p, q, s }) => {\n    camera.position.copy(p);\n    camera.quaternion.copy(new cannon_es__WEBPACK_IMPORTED_MODULE_1__.Quaternion(q._x, q._y, q._z, q._w));\n    camera.scale.copy(s);\n};\n\nconst addObject = ({ geometry, imageData, imageWidth, imageHeight, p, q, s }) => {\n    const shallowGeometry = geometry;\n    const buffergeo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();\n\n    for (let attributeName of Object.keys(shallowGeometry.attributes)) {\n        const shallowAttribute = shallowGeometry.attributes[attributeName];\n        const attribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(\n            shallowAttribute.array,\n            shallowAttribute.itemSize,\n            false\n        );\n        buffergeo.addAttribute(attributeName, attribute);\n    }\n\n    buffergeo.groups = shallowGeometry.groups;\n\n    let map = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(imageData, imageWidth, imageHeight, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);\n    map.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\n    map.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;\n    map.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearMipMapLinearFilter;\n    map.generateMipmaps = true;\n    map.needsUpdate = true;\n    const mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(buffergeo, new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({\n        map\n    }));\n    mesh.position.copy(p);\n    mesh.quaternion.copy(new cannon_es__WEBPACK_IMPORTED_MODULE_1__.Quaternion(q._x, q._y, q._z, q._w));\n    mesh.scale.copy(s);\n    mesh.updateMatrix();\n    scene.add(mesh);\n};\n\nconst messageHandlers = {\n    init,\n    updateCamera,\n    addObject\n};\n\nself.onmessage = ({ data }) => {\n    const { type } = data;\n    if (messageHandlers[type]) messageHandlers[type](data);\n    else console.log(\"No handler registered for \" + type);\n};\n\n//# sourceURL=webpack://the-grove/./src/js/graphics-worker.js?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_three_build_three_module_js"], () => (__webpack_require__("./src/js/graphics-worker.js")))
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
/******/ 			return "" + chunkId + ".js";
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
/******/ 			"src_js_graphics-worker_js": 1
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
/******/ 			return __webpack_require__.e("vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_three_build_three_module_js").then(next);
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