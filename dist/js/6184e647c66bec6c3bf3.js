/*!
 * 
 * Made with <3 by the Grove team | Mon Aug 09 2021 13:21:12 GMT-0500 (Central Daylight Time)
 *
 */
"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["src_js_game_meshTransform_ts"],{

/***/ "./src/js/ecs/view.ts":
/*!****************************!*\
  !*** ./src/js/ecs/view.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ EcsView)\n/* harmony export */ });\n/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ \"./src/js/ecs/entity.ts\");\nvar __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {\r\n    if (kind === \"m\") throw new TypeError(\"Private method is not writable\");\r\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a setter\");\r\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot write private member to an object whose class did not declare it\");\r\n    return (kind === \"a\" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;\r\n};\r\nvar __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {\r\n    if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a getter\");\r\n    if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot read private member from an object whose class did not declare it\");\r\n    return kind === \"m\" ? f : kind === \"a\" ? f.call(receiver) : f ? f.value : state.get(receiver);\r\n};\r\nvar _EcsView_ecs, _EcsView_signature;\r\n\r\n/**\r\n * Utility for calling `IEntityManager.submitQuery` which wraps the IDs in `Entity` objects\r\n */\r\nclass EcsView {\r\n    constructor(ecs, signature) {\r\n        /** Entity manager to iterate over */\r\n        _EcsView_ecs.set(this, void 0);\r\n        /** Signature to check entities for */\r\n        _EcsView_signature.set(this, void 0);\r\n        __classPrivateFieldSet(this, _EcsView_ecs, ecs, \"f\");\r\n        __classPrivateFieldSet(this, _EcsView_signature, signature, \"f\");\r\n    }\r\n    /** Execute a callback for every entity that matches signature */\r\n    iterateView(callback) {\r\n        const ids = __classPrivateFieldGet(this, _EcsView_ecs, \"f\").submitQuery(__classPrivateFieldGet(this, _EcsView_signature, \"f\"));\r\n        for (const id of ids)\r\n            callback(new _entity__WEBPACK_IMPORTED_MODULE_0__.default(__classPrivateFieldGet(this, _EcsView_ecs, \"f\"), id));\r\n    }\r\n}\r\n_EcsView_ecs = new WeakMap(), _EcsView_signature = new WeakMap();\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/ecs/view.ts?");

/***/ }),

/***/ "./src/js/game/meshTransform.ts":
/*!**************************************!*\
  !*** ./src/js/game/meshTransform.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MeshTransformScript)\n/* harmony export */ });\n/* harmony import */ var _ecs_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ecs/view */ \"./src/js/ecs/view.ts\");\n/* harmony import */ var _graphics_graphics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../graphics/graphics */ \"./src/js/graphics/graphics.ts\");\n/* harmony import */ var _physics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../physics */ \"./src/js/physics.ts\");\n/* harmony import */ var _script__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../script */ \"./src/js/script.ts\");\n\r\n\r\n\r\n\r\nclass MeshTransformScript extends _script__WEBPACK_IMPORTED_MODULE_0__.default {\r\n    constructor() {\r\n        super(...arguments);\r\n        this.transformView = new _ecs_view__WEBPACK_IMPORTED_MODULE_1__.default(this.ecs, new Set([_graphics_graphics__WEBPACK_IMPORTED_MODULE_2__.GraphicsData, _physics__WEBPACK_IMPORTED_MODULE_3__.PhysicsData]));\r\n    }\r\n    update(dt) {\r\n        this.transformView.iterateView((entity) => {\r\n            const body = entity.getComponent(_physics__WEBPACK_IMPORTED_MODULE_3__.PhysicsData);\r\n            const mesh = entity.getComponent(_graphics_graphics__WEBPACK_IMPORTED_MODULE_2__.GraphicsData);\r\n            const { x: px, y: py, z: pz } = body.interpolatedPosition;\r\n            const { x: qx, y: qy, z: qz, w: qw, } = body.interpolatedQuaternion;\r\n            mesh.position.set(px, py, pz);\r\n            if (!mesh.userData.norotate)\r\n                mesh.quaternion.set(qx, qy, qz, qw);\r\n        });\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/game/meshTransform.ts?");

/***/ }),

/***/ "./src/js/script.ts":
/*!**************************!*\
  !*** ./src/js/script.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GameScript)\n/* harmony export */ });\n/* harmony import */ var auto_bind__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! auto-bind */ \"./node_modules/auto-bind/index.js\");\n/* harmony import */ var auto_bind__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(auto_bind__WEBPACK_IMPORTED_MODULE_0__);\n\r\n/**\r\n * Helper class for making core engine systems available to derived classes\r\n *\r\n * If `queries` **IS** set, `update()` gets called once per each game entity which contains all\r\n * components specified in `queries`, and recieves that entity as a paramenter.\r\n *\r\n * If `queries` **IS NOT** set, `update()` is only called once, and is not passed any entities.\r\n *\r\n * @note `GameScript` employs Sindresorhus' `autoBind()` in the constructor, meaning there's no need\r\n * to call `this.method.bind(this)` when passing methods as callbacks.\r\n *\r\n * @example\r\n * this.graphics.doSomething(); // no need for accessing engine directly\r\n * this.assetLoader.loadModel('/assets/foo', this.loadCallback); // no need for .bind()\r\n */\r\nclass GameScript {\r\n    constructor(engine) {\r\n        this.engine = engine;\r\n        this.graphics = engine.graphics;\r\n        this.physics = engine.physics;\r\n        this.ecs = engine.ecs;\r\n        this.gui = engine.gui;\r\n        this.assetLoader = engine.assetLoader;\r\n        auto_bind__WEBPACK_IMPORTED_MODULE_0___default()(this);\r\n    }\r\n    /** @virtual */\r\n    // eslint-disable-next-line class-methods-use-this, no-empty-function\r\n    init() { }\r\n    /** @virtual */\r\n    // eslint-disable-next-line class-methods-use-this, no-empty-function\r\n    update(dt) { }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/script.ts?");

/***/ })

}]);