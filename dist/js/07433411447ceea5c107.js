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
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["src_js_game_player_ts"],{

/***/ "./src/js/game/health.ts":
/*!*******************************!*\
  !*** ./src/js/game/health.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"HealthData\": () => (/* binding */ HealthData),\n/* harmony export */   \"default\": () => (/* binding */ HealthScript)\n/* harmony export */ });\n/* harmony import */ var _ecs_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ecs/view */ \"./src/js/ecs/view.ts\");\n/* harmony import */ var _script__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../script */ \"./src/js/script.ts\");\n\r\n\r\n/**\r\n * Anything with a health component is alive.  Death is signified by removing the health component.\r\n */\r\nclass HealthData {\r\n}\r\nclass HealthScript extends _script__WEBPACK_IMPORTED_MODULE_0__.default {\r\n    constructor() {\r\n        super(...arguments);\r\n        this.healthView = new _ecs_view__WEBPACK_IMPORTED_MODULE_1__.default(this.ecs, new Set([HealthData]));\r\n    }\r\n    update() {\r\n        this.healthView.iterateView((entity) => {\r\n            const health = entity.getComponent(HealthData);\r\n            // cap hp value at max hp value\r\n            health.hp = Math.min(health.hp, health.max);\r\n            // this hoe dead\r\n            if (health.hp <= 0) {\r\n                entity.deleteComponent(HealthData);\r\n            }\r\n        });\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/game/health.ts?");

/***/ }),

/***/ "./src/js/game/player.ts":
/*!*******************************!*\
  !*** ./src/js/game/player.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"PLAYER_TAG\": () => (/* binding */ PLAYER_TAG),\n/* harmony export */   \"default\": () => (/* binding */ PlayerScript)\n/* harmony export */ });\n/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! cannon-es */ \"./node_modules/cannon-es/dist/cannon-es.js\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _ecs_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ecs/entity */ \"./src/js/ecs/entity.ts\");\n/* harmony import */ var _graphics_graphics__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../graphics/graphics */ \"./src/js/graphics/graphics.ts\");\n/* harmony import */ var _graphics_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../graphics/utils */ \"./src/js/graphics/utils.ts\");\n/* harmony import */ var _physics__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../physics */ \"./src/js/physics.ts\");\n/* harmony import */ var _script__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../script */ \"./src/js/script.ts\");\n/* harmony import */ var _health__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./health */ \"./src/js/game/health.ts\");\n/* harmony import */ var _keyboardControls__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./keyboardControls */ \"./src/js/game/keyboardControls.ts\");\n/* harmony import */ var _movement__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./movement */ \"./src/js/game/movement.ts\");\n/* harmony import */ var _score__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./score */ \"./src/js/game/score.ts\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n/**\r\n * Entity tag used to retrieve the player\r\n * @example Entity.getTag(PLAYER_TAG);\r\n */\r\nconst PLAYER_TAG = Symbol('player');\r\nclass PlayerScript extends _script__WEBPACK_IMPORTED_MODULE_0__.default {\r\n    init() {\r\n        const { canvas, ctx } = _graphics_utils__WEBPACK_IMPORTED_MODULE_1__.default.scratchCanvasContext(256, 256);\r\n        this.hudCanvas = canvas;\r\n        this.hudCtx = ctx;\r\n        this.player = new _ecs_entity__WEBPACK_IMPORTED_MODULE_2__.default()\r\n            .addTag(PLAYER_TAG);\r\n        this.player.setComponent(_health__WEBPACK_IMPORTED_MODULE_3__.HealthData, {\r\n            hp: 100,\r\n            max: 100,\r\n        });\r\n        this.player.setComponent(_score__WEBPACK_IMPORTED_MODULE_4__.default, {\r\n            score: 0,\r\n        });\r\n        // create physics body\r\n        const mass = 100;\r\n        const radius = 1;\r\n        const shape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Sphere(radius);\r\n        const playerBody = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({\r\n            collisionFilterGroup: 2,\r\n            allowSleep: false,\r\n            fixedRotation: true,\r\n            mass,\r\n        });\r\n        playerBody.addShape(shape);\r\n        playerBody.position.y = 12;\r\n        this.player.setComponent(_physics__WEBPACK_IMPORTED_MODULE_6__.PhysicsData, playerBody);\r\n        this.player.setComponent(_movement__WEBPACK_IMPORTED_MODULE_7__.MovementData, new _movement__WEBPACK_IMPORTED_MODULE_7__.MovementData(2.25, 0.7));\r\n        this.player.setComponent(_keyboardControls__WEBPACK_IMPORTED_MODULE_8__.KeyboardControlData, {});\r\n        this.hud = new _ecs_entity__WEBPACK_IMPORTED_MODULE_2__.default();\r\n        const hudSprite = new three__WEBPACK_IMPORTED_MODULE_9__.Sprite();\r\n        hudSprite.material = new three__WEBPACK_IMPORTED_MODULE_9__.SpriteMaterial();\r\n        hudSprite.position.set(0, -0.5, -1.3);\r\n        hudSprite.scale.set(0.2, 0.2, 0.2);\r\n        hudSprite.parent = _ecs_entity__WEBPACK_IMPORTED_MODULE_2__.default.getTag(_graphics_graphics__WEBPACK_IMPORTED_MODULE_10__.CAMERA_TAG).getComponent(_graphics_graphics__WEBPACK_IMPORTED_MODULE_10__.CameraData);\r\n        this.hud.setComponent(_graphics_graphics__WEBPACK_IMPORTED_MODULE_10__.GraphicsData, hudSprite);\r\n        this.drawHUD();\r\n        // handle impact damage\r\n        playerBody.addEventListener('collide', ({ contact }) => {\r\n            const health = this.player.getComponent(_health__WEBPACK_IMPORTED_MODULE_3__.HealthData);\r\n            const impact = contact.getImpactVelocityAlongNormal();\r\n            if (Math.abs(impact) >= 15) {\r\n                health.hp -= Math.floor(Math.abs(impact) / 10);\r\n                this.drawHUD();\r\n            }\r\n        });\r\n        // handle enemy deaths\r\n        this.ecs.events.on('enemyDied', () => {\r\n            const score = this.player.getComponent(_score__WEBPACK_IMPORTED_MODULE_4__.default);\r\n            score.score += 1;\r\n            this.drawHUD();\r\n        });\r\n        // heal\r\n        this.ecs.events.on('healPlayer', (amount) => {\r\n            const health = this.player.getComponent(_health__WEBPACK_IMPORTED_MODULE_3__.HealthData);\r\n            health.hp += amount;\r\n            this.drawHUD();\r\n        });\r\n        // handle death\r\n        this.ecs.events.on(`delete${_health__WEBPACK_IMPORTED_MODULE_3__.HealthData.name}Component`, (id) => {\r\n            const score = this.player.getComponent(_score__WEBPACK_IMPORTED_MODULE_4__.default);\r\n            if (id === this.player.id) {\r\n                document.querySelector('#blocker')?.setAttribute('style', 'display:block');\r\n                const loadText = document.querySelector('#load');\r\n                loadText.setAttribute('style', 'display:block');\r\n                loadText.innerHTML = `<h1>You Have Perished. Score... ${score.score}</h1>`;\r\n            }\r\n        });\r\n        // attach data to debug GUI\r\n        this.gui.add(playerBody.interpolatedPosition, 'x').listen();\r\n        this.gui.add(playerBody.interpolatedPosition, 'y').listen();\r\n        this.gui.add(playerBody.interpolatedPosition, 'z').listen();\r\n    }\r\n    drawHUD() {\r\n        const score = this.player.getComponent(_score__WEBPACK_IMPORTED_MODULE_4__.default);\r\n        const health = this.player.getComponent(_health__WEBPACK_IMPORTED_MODULE_3__.HealthData);\r\n        const hudSprite = this.hud.getComponent(_graphics_graphics__WEBPACK_IMPORTED_MODULE_10__.GraphicsData);\r\n        this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);\r\n        this.hudCtx.font = '52px Arial';\r\n        this.hudCtx.fillStyle = 'red';\r\n        this.hudCtx.textAlign = 'center';\r\n        this.hudCtx.fillText(`${health.hp}/${health.max}HP`, this.hudCanvas.width / 2, 54);\r\n        this.hudCtx.fillText(`${score.score} points`, this.hudCanvas.width / 2, 108);\r\n        hudSprite.material.map = new three__WEBPACK_IMPORTED_MODULE_9__.CanvasTexture(this.hudCanvas);\r\n        this.graphics.updateMaterial(hudSprite);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/game/player.ts?");

/***/ }),

/***/ "./src/js/game/score.ts":
/*!******************************!*\
  !*** ./src/js/game/score.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ ScoreData)\n/* harmony export */ });\nclass ScoreData {\r\n}\r\n\n\n//# sourceURL=webpack://the-grove/./src/js/game/score.ts?");

/***/ })

}]);