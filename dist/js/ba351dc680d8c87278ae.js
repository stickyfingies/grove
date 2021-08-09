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
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["src_js_game_pauseMenu_ts"],{

/***/ "./src/js/game/pauseMenu.ts":
/*!**********************************!*\
  !*** ./src/js/game/pauseMenu.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PauseMenuScript)\n/* harmony export */ });\n/* harmony import */ var _script__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../script */ \"./src/js/script.ts\");\n\r\nclass PauseMenuScript extends _script__WEBPACK_IMPORTED_MODULE_0__.default {\r\n    // eslint-disable-next-line class-methods-use-this\r\n    init() {\r\n        const pointerlockchange = () => {\r\n            const isLocked = (document.pointerLockElement === document.body);\r\n            // actually pause game simulation\r\n            this.engine.running = isLocked;\r\n            // toggle pause menu\r\n            document.querySelector('#pause')?.setAttribute('style', `display:${isLocked ? 'none' : 'block'}`);\r\n            // hide black screen when game starts\r\n            if (isLocked)\r\n                document.querySelector('#blocker')?.setAttribute('style', 'display:none');\r\n        };\r\n        document.addEventListener('pointerlockchange', pointerlockchange);\r\n        const click = () => {\r\n            document.body.requestFullscreen();\r\n            document.body.requestPointerLock();\r\n        };\r\n        for (const btn of document.querySelectorAll('.play-btn'))\r\n            btn.addEventListener('click', click);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/game/pauseMenu.ts?");

/***/ }),

/***/ "./src/js/script.ts":
/*!**************************!*\
  !*** ./src/js/script.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GameScript)\n/* harmony export */ });\n/* harmony import */ var auto_bind__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! auto-bind */ \"./node_modules/auto-bind/index.js\");\n/* harmony import */ var auto_bind__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(auto_bind__WEBPACK_IMPORTED_MODULE_0__);\n\r\n/**\r\n * Helper class for making core engine systems available to derived classes\r\n *\r\n * If `queries` **IS** set, `update()` gets called once per each game entity which contains all\r\n * components specified in `queries`, and recieves that entity as a paramenter.\r\n *\r\n * If `queries` **IS NOT** set, `update()` is only called once, and is not passed any entities.\r\n *\r\n * @note `GameScript` employs Sindresorhus' `autoBind()` in the constructor, meaning there's no need\r\n * to call `this.method.bind(this)` when passing methods as callbacks.\r\n *\r\n * @example\r\n * this.graphics.doSomething(); // no need for accessing engine directly\r\n * this.assetLoader.loadModel('/assets/foo', this.loadCallback); // no need for .bind()\r\n */\r\nclass GameScript {\r\n    constructor(engine) {\r\n        this.engine = engine;\r\n        this.graphics = engine.graphics;\r\n        this.physics = engine.physics;\r\n        this.ecs = engine.ecs;\r\n        this.gui = engine.gui;\r\n        this.assetLoader = engine.assetLoader;\r\n        auto_bind__WEBPACK_IMPORTED_MODULE_0___default()(this);\r\n    }\r\n    /** @virtual */\r\n    // eslint-disable-next-line class-methods-use-this, no-empty-function\r\n    init() { }\r\n    /** @virtual */\r\n    // eslint-disable-next-line class-methods-use-this, no-empty-function\r\n    update(dt) { }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/script.ts?");

/***/ })

}]);