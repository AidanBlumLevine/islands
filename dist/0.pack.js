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

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\naddEventListener('message', (evt) => {\r\n    let data = evt.data;\r\n    let vals = data.vals;\r\n    let parameters = evt.data.parameters;\r\n    let w = parameters.size + 2;\r\n    for (let x = 0; x < parameters.size + 1; x++) {\r\n        for (let y = 0; y < parameters.size + 1; y++) {\r\n            let cornervals = [vals.get((x - 1) + (y - 1) * w), vals.get(x + (y - 1) * w), vals.get(x + y * w), vals.get((x - 1) + y * w)];\r\n            for (let layer of layers) {\r\n                add_edges(layer, cornervals, x, y);\r\n            }\r\n            if (evt.data.generate_image) {\r\n                let color = colorgradient(cornervals[0]);\r\n                postMessage({\r\n                    type: \"fill_pixel\",\r\n                    color: \"rgb(\" + color[0] + \",\" + color[1] + \",\" + color[2] + \")\",\r\n                    x: parameters.size + 1 - x,\r\n                    y: y - 2\r\n                });\r\n            }\r\n        }\r\n    }\r\n});\r\n\r\n\n\n//# sourceURL=webpack://islands/./src/worker.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/worker.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;