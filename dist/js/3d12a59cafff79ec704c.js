/*!
 * 
 * Made with <3 by the Grove team | Mon Aug 09 2021 13:21:12 GMT-0500 (Central Daylight Time)
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

/***/ "./src/js/graphics/backend.three.ts":
/*!******************************************!*\
  !*** ./src/js/graphics/backend.three.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GraphicsBackend)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/**\r\n * @see graphics.ts for information on how object transforms are communicated\r\n */\r\nvar __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {\r\n    if (kind === \"m\") throw new TypeError(\"Private method is not writable\");\r\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a setter\");\r\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot write private member to an object whose class did not declare it\");\r\n    return (kind === \"a\" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;\r\n};\r\nvar __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {\r\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a getter\");\r\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot read private member from an object whose class did not declare it\");\r\n    return kind === \"m\" ? f : kind === \"a\" ? f.call(receiver) : f ? f.value : state.get(receiver);\r\n};\r\nvar _GraphicsBackend_camera, _GraphicsBackend_scene, _GraphicsBackend_renderer, _GraphicsBackend_idToObject, _GraphicsBackend_textureCache, _GraphicsBackend_elementsPerTransform;\r\n\r\n/**\r\n * Graphics backend designed to be ran on a WebWorker\r\n */\r\nclass GraphicsBackend {\r\n    constructor() {\r\n        /**\r\n         * main camera used to render the scene\r\n         * @note camera has Id#0\r\n         */\r\n        _GraphicsBackend_camera.set(this, new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(60, 1, 0.1, 2000));\r\n        /** a scene graph object which holds all renderable meshes */\r\n        _GraphicsBackend_scene.set(this, new three__WEBPACK_IMPORTED_MODULE_0__.Scene());\r\n        /** ThreeJS WebGL renderer instance */\r\n        _GraphicsBackend_renderer.set(this, void 0);\r\n        /** map of mesh IDs to mesh instances */\r\n        _GraphicsBackend_idToObject.set(this, new Map());\r\n        /** map of texture identifiers to raw image data */\r\n        _GraphicsBackend_textureCache.set(this, new Map());\r\n        /** number of elements per each transform matrix in the shared array buffer */\r\n        _GraphicsBackend_elementsPerTransform.set(this, 16);\r\n    }\r\n    init({ canvas, buffer, }) {\r\n        const transformArray = new Float32Array(buffer);\r\n        const context = canvas.getContext('webgl2', { antialias: true });\r\n        // initialize renderer instance\r\n        __classPrivateFieldSet(this, _GraphicsBackend_renderer, new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({\r\n            canvas,\r\n            context,\r\n            antialias: true,\r\n        }), \"f\");\r\n        __classPrivateFieldGet(this, _GraphicsBackend_renderer, \"f\").setClearColor(0x000000);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_renderer, \"f\").shadowMap.enabled = true;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_renderer, \"f\").shadowMap.type = three__WEBPACK_IMPORTED_MODULE_0__.PCFSoftShadowMap;\r\n        // set up camera\r\n        __classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\").matrixAutoUpdate = false;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").add(__classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\"));\r\n        __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\").set(0, __classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\"));\r\n        // test cube\r\n        const cube = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(6, 6, 6), new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({\r\n            color: 0xff0000,\r\n        }));\r\n        cube.position.y = 30;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").add(cube);\r\n        // grid\r\n        const grid = new three__WEBPACK_IMPORTED_MODULE_0__.GridHelper(100, 100);\r\n        grid.position.y = 1;\r\n        // grid.rotateX(Math.PI / 2);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").add(grid);\r\n        const grid1 = new three__WEBPACK_IMPORTED_MODULE_0__.GridHelper(99, 50, 0xff00ff, 0xff0000);\r\n        grid1.position.y = 1.1;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").add(grid1);\r\n        // graphics thread render loop\r\n        const render = () => {\r\n            cube.rotateY(0.01);\r\n            this.readTransformsFromArray(transformArray);\r\n            __classPrivateFieldGet(this, _GraphicsBackend_renderer, \"f\").render(__classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\"), __classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\"));\r\n            requestAnimationFrame(render);\r\n        };\r\n        // start rendering\r\n        requestAnimationFrame(render);\r\n    }\r\n    /** Copy object transforms into their corresponding ThreeJS renderable */\r\n    readTransformsFromArray(transformArray) {\r\n        for (const [id, object] of __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\")) {\r\n            const offset = id * __classPrivateFieldGet(this, _GraphicsBackend_elementsPerTransform, \"f\");\r\n            const matrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray(transformArray, offset);\r\n            // ! <hack/>\r\n            // before the main thread starts pushing object matrices to the transform buffer,\r\n            // there will be a period of time where `matrix` consists of entirely zeroes.\r\n            // ThreeJS doesn't particularly like when scale elements are zero, so set them\r\n            // to something else as a fix.\r\n            if (matrix.elements[0] === 0)\r\n                matrix.makeScale(0.1, 0.1, 0.1);\r\n            object.matrix.copy(matrix);\r\n        }\r\n    }\r\n    /** Emplaces raw texture data into a ThreeJS texture object */\r\n    uploadTexture({ imageId, imageData, imageWidth, imageHeight, }) {\r\n        const map = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(imageData, imageWidth, imageHeight, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);\r\n        map.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\r\n        map.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;\r\n        map.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;\r\n        map.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearMipMapLinearFilter;\r\n        map.generateMipmaps = true;\r\n        map.flipY = true;\r\n        map.needsUpdate = true;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_textureCache, \"f\").set(imageId, map);\r\n    }\r\n    /** Updates the material of a renderable object */\r\n    updateMaterial({ material, id }) {\r\n        const mat = this.deserializeMaterial(material);\r\n        const mesh = __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\").get(id);\r\n        mesh.material = mat;\r\n    }\r\n    /** Adds a renderable object to the scene */\r\n    addObject({ id, mesh, }) {\r\n        const mat = [];\r\n        if (mesh.materials) {\r\n            for (const material of mesh.materials) {\r\n                mat.push(this.deserializeMaterial(material));\r\n            }\r\n        }\r\n        mesh.images = [];\r\n        mesh.textures = [];\r\n        const object = new three__WEBPACK_IMPORTED_MODULE_0__.ObjectLoader().parse(mesh);\r\n        if (object instanceof three__WEBPACK_IMPORTED_MODULE_0__.Mesh || object instanceof three__WEBPACK_IMPORTED_MODULE_0__.Sprite) {\r\n            object.material = mat.length > 1 ? mat : mat[0];\r\n        }\r\n        object.matrixAutoUpdate = false;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").add(object);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\").set(id, object);\r\n    }\r\n    /** Removes a renderable object from the scene */\r\n    removeObject({ id }) {\r\n        const object = __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\").get(id);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_idToObject, \"f\").delete(id);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_scene, \"f\").remove(object);\r\n    }\r\n    /** Resizes the render target */\r\n    resize({ width, height, pixelRatio }) {\r\n        console.log(`resize ${width}, ${height}, ${pixelRatio}`);\r\n        __classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\").aspect = width / height;\r\n        __classPrivateFieldGet(this, _GraphicsBackend_camera, \"f\").updateProjectionMatrix();\r\n        __classPrivateFieldGet(this, _GraphicsBackend_renderer, \"f\").setSize(width, height, false);\r\n        // For *WHATEVER REASON*, passing the pixel ratio actually messes shit up on HiDPI displays\r\n        // this.#renderer.setPixelRatio(pixelRatio);\r\n    }\r\n    /** Takes a JSON material description and creates a tangible (textured) ThreeJS material */\r\n    deserializeMaterial(json) {\r\n        const { map, alphaMap, normalMap, specularMap, } = json;\r\n        // [?] can this process be automated\r\n        delete json.map; //\r\n        delete json.matcap;\r\n        delete json.alphaMap; //\r\n        delete json.bumpMap;\r\n        delete json.normalMap; //\r\n        delete json.displacementMap;\r\n        delete json.roughnessMap;\r\n        delete json.metalnessMap;\r\n        delete json.emissiveMap;\r\n        delete json.specularMap; //\r\n        delete json.envMap;\r\n        delete json.lightMap;\r\n        delete json.aoMap;\r\n        const mat = new three__WEBPACK_IMPORTED_MODULE_0__.MaterialLoader().parse(json);\r\n        // assign textures\r\n        if (map)\r\n            mat.map = __classPrivateFieldGet(this, _GraphicsBackend_textureCache, \"f\").get(map);\r\n        if (alphaMap)\r\n            mat.alphaMap = __classPrivateFieldGet(this, _GraphicsBackend_textureCache, \"f\").get(alphaMap);\r\n        if (normalMap)\r\n            mat.normalMap = __classPrivateFieldGet(this, _GraphicsBackend_textureCache, \"f\").get(normalMap);\r\n        if (specularMap)\r\n            mat.specularMap = __classPrivateFieldGet(this, _GraphicsBackend_textureCache, \"f\").get(specularMap);\r\n        return mat;\r\n    }\r\n}\r\n_GraphicsBackend_camera = new WeakMap(), _GraphicsBackend_scene = new WeakMap(), _GraphicsBackend_renderer = new WeakMap(), _GraphicsBackend_idToObject = new WeakMap(), _GraphicsBackend_textureCache = new WeakMap(), _GraphicsBackend_elementsPerTransform = new WeakMap();\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/graphics/backend.three.ts?");

/***/ }),

/***/ "./src/js/graphics/worker.ts":
/*!***********************************!*\
  !*** ./src/js/graphics/worker.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _backend_three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./backend.three */ \"./src/js/graphics/backend.three.ts\");\n\r\nconst backend = new _backend_three__WEBPACK_IMPORTED_MODULE_0__.default();\r\nonmessage = ({ data }) => {\r\n    const type = data.type;\r\n    if (type in backend)\r\n        backend[type](data);\r\n    else\r\n        throw new Error(`[render thread] command ${type} does not exist on this graphics backend`);\r\n};\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/graphics/worker.ts?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_three_build_three_module_js"], () => (__webpack_require__("./src/js/graphics/worker.ts")))
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
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
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
/******/ 			return "" + "ddf448661656608ac5f2" + ".js";
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
/******/ 			"src_js_graphics_worker_ts": 1
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