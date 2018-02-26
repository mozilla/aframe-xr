/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// require('three.xr.js');

__webpack_require__(1);

__webpack_require__(2);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(5);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


AFRAME.registerSystem('xr', {
  schema: {
    arAutostart: { default: true },
    arLightEstimate: { default: true }
  },
  init: function init() {
    this.sceneEl.setAttribute('vr-mode-ui', { enabled: false });
    this.bindMethods();
    this.sceneEl.addEventListener('loaded', this.wrapSceneMethods);
    this.lightEstimate = 1;
  },
  bindMethods: function bindMethods() {
    this.updateFrame = this.updateFrame.bind(this);
    this.sessionStarted = this.sessionStarted.bind(this);
    this.sessionEnded = this.sessionEnded.bind(this);
    this.poseLost = this.poseLost.bind(this);
    this.poseFound = this.poseFound.bind(this);
    this.wrapSceneMethods = this.wrapSceneMethods.bind(this);
  },
  wrapSceneMethods: function wrapSceneMethods() {
    var sceneEl = this.sceneEl;
    // Store references to the original function
    sceneEl._enterVR = sceneEl.enterVR;
    sceneEl._exitVR = sceneEl.exitVR;
    sceneEl._resize = sceneEl.resize;
    sceneEl._render = sceneEl.render;

    var self = this;
    sceneEl.enterAR = function () {
      this.renderer.xr.startSession(self.lastARDisplay, 'ar', true);
    };
    sceneEl.exitAR = function () {
      this.renderer.xr.endSession();
    };
    sceneEl.enterVR = function (fromExternal) {
      this.renderer.xr.dispatchEvent({ type: 'sessionStarted', session: this.renderer.xr.session });
      sceneEl._enterVR(fromExternal);
    };
    sceneEl.exitVR = function () {
      this.renderer.xr.dispatchEvent({ type: 'sessionEnded', session: this.renderer.xr.session });
      sceneEl._exitVR();
    };

    sceneEl.render = function () {
      if (self.activeRealityType !== 'ar') {
        sceneEl._render();
      }
    };

    this.activeRealityType = 'magicWindow';

    if (this.el.camera) {
      this.cameraActivated();
    } else {
      this.el.addEventListener('camera-set-active', function (evt) {
        self.cameraActivated();
      });
    }
  },

  cameraActivated: function cameraActivated() {
    var self = this;
    this.el.emit('realityChanged', 'magicWindow');
    THREE.WebXRUtils.getDisplays().then(self.initXR.bind(self));
  },

  initXR: function initXR(displays) {
    var sceneEl = this.sceneEl;
    sceneEl.renderer.autoClear = false;

    this.supportAR = false;
    for (var i = 0; i < displays.length; i++) {
      var display = displays[i];
      if (display.supportedRealities.ar) {
        this.supportAR = true;
      }
    }

    this.el.emit('xrInitialized');

    var options = {
      // Flag to start AR if is the unique display available.
      AR_AUTOSTART: this.data.arAutostart // Default: true
    };
    sceneEl.renderer.xr = new THREE.WebXRManager(options, displays, sceneEl.renderer, sceneEl.camera, sceneEl.object3D, this.updateFrame);
    sceneEl.renderer.xr.addEventListener('sessionStarted', this.sessionStarted);
    sceneEl.renderer.xr.addEventListener('sessionEnded', this.sessionEnded);

    sceneEl.renderer.xr.addEventListener('poseLost', this.poseLost);
    sceneEl.renderer.xr.addEventListener('poseFound', this.poseFound);

    if (sceneEl.renderer.xr.totalSupportedDisplays === 0) {
      this.sceneEl.setAttribute('vr-mode-ui', { enabled: true });
      // this.sceneEl.setAttribute('ar-mode-ui', {enabled: true});
    } else {
      if (!sceneEl.renderer.xr.autoStarted) {
        this.addEnterButtons(displays);
      }
    }
  },

  // NOW it only supports one VR and one AR display
  // TODO support more than two displays simultaneously
  addEnterButtons: function addEnterButtons(displays) {
    for (var i = 0; i < displays.length; i++) {
      var display = displays[i];
      if (display.supportedRealities.vr) {
        this.lastVRDisplay = display;
        this.sceneEl.setAttribute('vr-mode-ui', { enabled: true });
      }
      if (display.supportedRealities.ar) {
        this.lastARDisplay = display;
        this.sceneEl.setAttribute('ar-mode-ui', { enabled: true });
      }
    }
  },
  sessionStarted: function sessionStarted(data) {
    if (data.session && data.session.realityType) {
      this.activeRealityType = data.session.realityType;
      this.el.emit('realityChanged', this.activeRealityType);
      if (this.activeRealityType === 'ar') {
        // To show camera on iOS devices
        document.documentElement.style.backgroundColor = 'transparent';
        document.body.style.backgroundColor = 'transparent';
      }
    }
  },

  sessionEnded: function sessionEnded(data) {
    this.activeRealityType = 'magicWindow';
    this.el.emit('realityChanged', this.activeRealityType);
    if (this.activeRealityType === 'ar') {
      // To show camera on iOS devices
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }
  },

  poseLost: function poseLost() {
    this.el.emit('poseLost');
  },

  poseFound: function poseFound() {
    this.el.emit('poseFound');
  },
  update: function update() {
    if (this.data.arLightEstimate) {
      this.lightsArray = this.el.sceneEl.querySelectorAll('[light]');
      var self = this;
      this.lightsArrayInterval = setInterval(function () {
        self.lightsArray = self.el.sceneEl.querySelectorAll('[light]');
      }, 2000);
    } else {
      if (this.lightsArrayInterval) {
        clearInterval(this.lightsArrayInterval);
      }
    }
  },
  updateFrame: function updateFrame(frame) {
    this.el.emit('updateFrame', frame);
    // Custom code for each frame rendered
    if (frame.hasLightEstimate && this.data.arLightEstimate) {
      for (var i = 0; i < this.lightsArray.length; i++) {
        var element = this.lightsArray[i];
        if (!element.getObject3D('light').originalIntensity) {
          element.getObject3D('light').originalIntensity = element.getAttribute('light').intensity;
        }
        this.lightEstimate = frame.lightEstimate;
        element.setAttribute('light', 'intensity', element.getObject3D('light').originalIntensity * frame.lightEstimate);
      }
    }
  }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENTER_VR_CLASS = 'a-enter-vr';
var ENTER_AR_BTN_CLASS = 'a-enter-ar-button';
var EXIT_AR_BTN_CLASS = 'a-exit-ar-button';
var HIDDEN_CLASS = 'a-hidden';

/**
 * UI for entering AR mode.
 */
AFRAME.registerComponent('ar-mode-ui', {
  dependencies: ['canvas'],

  schema: {
    enabled: { default: true }
  },

  init: function init() {
    var self = this;
    var sceneEl = this.el;

    if (AFRAME.utils.getUrlParameter('ui') === 'false') {
      return;
    }

    // Add styles to support multiple buttons and to have consistent design
    var sheet = document.createElement('style');
    sheet.innerHTML = '.a-enter-vr {text-align: center;right: 10px;}';
    sheet.innerHTML += '.a-enter-vr-button {background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIyMDQ4cHgiIGhlaWdodD0iMjA0OHB4IiB2aWV3Qm94PSIwIDAgMjA0OCAyMDQ4IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDQ4IDIwNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHRpdGxlPm1hc2s8L3RpdGxlPg0KPGc+DQoJPHJlY3QgeD0iMTQ0LjIzMiIgeT0iNTg3LjI3NiIgZmlsbD0ibm9uZSIgd2lkdGg9IjE4NjYuMTg3IiBoZWlnaHQ9IjEzNDEuMTM0Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTc4MS42NjksNTg2LjU4OWgxOTguNzk3bC0zMTQuMTI1LDkyMUg0ODUuNzAxbC0zMTEuODEyLTkyMWgyMDUuNjU2bDIwMC4xODgsNjk5LjE4OEw3ODEuNjY5LDU4Ni41ODl6Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTE2ODYuMjc5LDYxMC4zMjRjMzMuOTM4LDE0LjU3OCw2Mi43MDMsMzYuMDMxLDg2LjI4MSw2NC4zNDRjMTkuNTE2LDIzLjMyOCwzNC45NjksNDkuMTU2LDQ2LjM0NCw3Ny40NjkNCgkJczE3LjA3OCw2MC41OTQsMTcuMDc4LDk2LjgxMmMwLDQzLjcxOS0xMS4wNDcsODYuNzE5LTMzLjE0MSwxMjguOTg0Yy0yMi4wOTQsNDIuMjgxLTU4LjU0Nyw3Mi4xNTctMTA5LjM5MSw4OS42NDENCgkJYzQyLjM3NSwxNy4xMjUsNzIuMzkxLDQxLjQzOCw5MC4wNDcsNzIuOTUzYzE3LjY1NiwzMS41MzEsMjYuNDg0LDc5LjU2MiwyNi40ODQsMTQ0LjA5NHY2MS44MjgNCgkJYzAsNDIuMDYyLDEuNzAzLDcwLjU3OCw1LjEyNSw4NS41NjJjNS4xMjUsMjMuNzUsMTcuMDc4LDQxLjIzNCwzNS44NzUsNTIuNDY5djIzLjEwOWgtMjEyLjMyOA0KCQljLTUuNzgxLTIwLjQwNi05LjkwNi0zNi44NDQtMTIuMzc1LTQ5LjM0NGMtNC45NjktMjUuODEyLTcuNjU2LTUyLjI1LTguMDYyLTc5LjMxMmwtMS4yMzQtODUuNTc4DQoJCWMtMC43OTctNTguNzAzLTEwLjk2OS05Ny44NDQtMzAuNTMxLTExNy40MDZzLTU2LjIxOS0yOS4zNTktMTA5Ljk1My0yOS4zNTloLTE4OC41MTZ2MzYxaC0xODh2LTkyMWg0NDAuODc1DQoJCUMxNjAzLjg1Nyw1ODcuODM5LDE2NTIuMzQyLDU5NS43NjEsMTY4Ni4yNzksNjEwLjMyNHogTTEyODcuOTgyLDc0NS41ODl2MjQ4aDIwNy41MzFjNDEuMjE5LDAsNzIuMTQxLTUsOTIuNzY2LTE1LjAzMQ0KCQljMzYuNDY5LTE3LjUzMSw1NC43MDMtNTIuMTcyLDU0LjcwMy0xMDMuOTUzYzAtNTUuOTM4LTE3LjY0MS05My41MTYtNTIuOTIyLTExMi43MzRjLTE5LjgyOC0xMC44NDQtNDkuNTYyLTE2LjI4MS04OS4yMDMtMTYuMjgxDQoJCUgxMjg3Ljk4MnoiLz4NCjwvZz4NCjwvc3ZnPg0K) 50% 50%/70% 70% no-repeat rgba(0,0,0,.35);';
    sheet.innerHTML += 'position: relative;';
    sheet.innerHTML += 'margin-right: 10px;';
    sheet.innerHTML += '}';

    sheet.innerHTML += '.a-enter-ar-button {background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIyMDQ4cHgiIGhlaWdodD0iMjA0OHB4IiB2aWV3Qm94PSIwIDAgMjA0OCAyMDQ4IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDQ4IDIwNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHRpdGxlPm1hc2s8L3RpdGxlPg0KPGc+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTQzOS45NzIsNTg0LjgzNWgyMTcuNjI1bDMyNS4zNDUsOTIxaC0yMDguNzJsLTYwLjU3Ny0xODloLTMzOS4yNWwtNjIuNDIzLDE4OWgtMjAxLjExTDQzOS45NzIsNTg0LjgzNXoNCgkJIE00MjYuODc4LDExNTcuODM1aDIzNS44MTJMNTQ2LjU1LDc5NS4zOTZMNDI2Ljg3OCwxMTU3LjgzNXoiLz4NCgk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTY5MC43MjMsNjA4LjU2OWMzMy45MzgsMTQuNTc3LDYyLjcwMiwzNi4wMyw4Ni4yOCw2NC4zNDRjMTkuNTE3LDIzLjMyOCwzNC45Nyw0OS4xNTYsNDYuMzQ1LDc3LjQ2OQ0KCQljMTEuMzc1LDI4LjMxMywxNy4wNzcsNjAuNTk0LDE3LjA3Nyw5Ni44MTJjMCw0My43MTktMTEuMDQ3LDg2LjcxOS0zMy4xNDEsMTI4Ljk4M2MtMjIuMDk1LDQyLjI4MS01OC41NDcsNzIuMTU2LTEwOS4zOTIsODkuNjQyDQoJCWM0Mi4zNzUsMTcuMTI1LDcyLjM5Miw0MS40MzgsOTAuMDQ3LDcyLjk1MmMxNy42NTYsMzEuNTMxLDI2LjQ4NCw3OS41NjIsMjYuNDg0LDE0NC4wOTV2NjEuODI4DQoJCWMwLDQyLjA2MiwxLjcwMyw3MC41NzcsNS4xMjUsODUuNTYyYzUuMTI1LDIzLjc1LDE3LjA3OCw0MS4yMzQsMzUuODc1LDUyLjQ2OXYyMy4xMDloLTIxMi4zMjgNCgkJYy01Ljc4MS0yMC40MDYtOS45MDYtMzYuODQ0LTEyLjM3NS00OS4zNDRjLTQuOTY5LTI1LjgxMi03LjY1Ni01Mi4yNS04LjA2Mi03OS4zMTJsLTEuMjM0LTg1LjU3OA0KCQljLTAuNzk3LTU4LjcwMy0xMC45NjktOTcuODQ0LTMwLjUzLTExNy40MDVjLTE5LjU2Mi0xOS41NjItNTYuMjItMjkuMzU5LTEwOS45NTMtMjkuMzU5aC0xODguNTE3djM2MWgtMTg4di05MjFIMTU0NS4zDQoJCUMxNjA4LjMsNTg2LjA4NSwxNjU2Ljc4NCw1OTQuMDA3LDE2OTAuNzIzLDYwOC41Njl6IE0xMjkyLjQyNSw3NDMuODM1djI0OGgyMDcuNTMxYzQxLjIxOSwwLDcyLjE0Mi01LDkyLjc2Ny0xNS4wMzENCgkJYzM2LjQ2OS0xNy41Myw1NC43MDItNTIuMTcyLDU0LjcwMi0xMDMuOTUzYzAtNTUuOTM4LTE3LjY0MS05My41MTYtNTIuOTIyLTExMi43MzNjLTE5LjgyOC0xMC44NDQtNDkuNTYyLTE2LjI4MS04OS4yMDMtMTYuMjgxDQoJCUwxMjkyLjQyNSw3NDMuODM1TDEyOTIuNDI1LDc0My44MzV6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==) 50% 50%/70% 70% no-repeat rgba(0,0,0,.35);';
    sheet.innerHTML += 'border: 0;';
    sheet.innerHTML += 'bottom: 0;';
    sheet.innerHTML += 'cursor: pointer;';
    sheet.innerHTML += 'min-width: 50px;';
    sheet.innerHTML += 'min-height: 30px;';
    sheet.innerHTML += 'padding-right: 5%;';
    sheet.innerHTML += 'padding-top: 4%;';
    sheet.innerHTML += 'transition: background-color .05s ease;';
    sheet.innerHTML += '-webkit-transition: background-color .05s ease;';
    sheet.innerHTML += 'z-index: 9999;';
    sheet.innerHTML += 'margin-right: 10px;}';
    sheet.innerHTML += '.a-enter-ar-button:active,.a-enter-ar-button:hover { background-color: #666;';
    sheet.innerHTML += '}';

    sheet.innerHTML += '.a-exit-ar-button {background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIyMDQ4cHgiIGhlaWdodD0iMjA0OHB4IiB2aWV3Qm94PSIwIDAgMjA0OCAyMDQ4IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDQ4IDIwNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHRpdGxlPm1hc2s8L3RpdGxlPg0KPHJlY3QgeD0iNTYxLjI3MyIgeT0iNTg0LjgzNiIgZmlsbD0ibm9uZSIgd2lkdGg9IjEzODMuMTM5IiBoZWlnaHQ9IjEzODMuMTM5Ii8+DQo8ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3ICAgICI+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTgwNi41MDgsMTUwNS4xNDhINTgyLjc3NGwyOTYuMDE2LTQ2OS4yNWwtMjgyLjAxNi00NTEuNzVoMjMwLjA0N2wxNjQuNDM4LDMwMC4wMTZsMTY4Ljk2OC0zMDAuMDE2DQoJCWgyMjIuNTQ3bC0yODIuMDE2LDQ0NC4yNWwzMDAuMDE2LDQ3Ni43NWgtMjMzLjg5MWwtMTc1LjUzMS0zMTQuMTU2TDgwNi41MDgsMTUwNS4xNDh6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==) 50% 50%/70% 70% no-repeat rgba(0,0,0,.35);';
    sheet.innerHTML += 'border: 0;';
    sheet.innerHTML += 'bottom: 0;';
    sheet.innerHTML += 'cursor: pointer;';
    sheet.innerHTML += 'min-width: 30px;';
    sheet.innerHTML += 'min-height: 30px;';
    sheet.innerHTML += 'padding-right: 5%;';
    sheet.innerHTML += 'padding-top: 4%;';
    sheet.innerHTML += 'transition: background-color .05s ease;';
    sheet.innerHTML += '-webkit-transition: background-color .05s ease;';
    sheet.innerHTML += 'z-index: 9999;';
    sheet.innerHTML += 'display: none;';
    sheet.innerHTML += 'margin-right: 10px;}';
    sheet.innerHTML += '.a-exit-ar-button:active,.a-exit-ar-button:hover { background-color: #666;';
    sheet.innerHTML += '}';
    document.body.appendChild(sheet);

    this.enterAR = sceneEl.enterAR.bind(sceneEl);
    this.exitAR = sceneEl.exitAR.bind(sceneEl);
    this.insideLoader = false;
    this.enterAREl = null;

    // Hide/show AR UI when entering/exiting VR mode.
    sceneEl.addEventListener('enter-vr', this.updateEnterARInterface.bind(this));
    sceneEl.addEventListener('exit-vr', this.updateEnterARInterface.bind(this));

    window.addEventListener('message', function (event) {
      if (event.data.type === 'loaderReady') {
        self.insideLoader = true;
        self.remove();
      }
    });
  },

  update: function update() {
    var sceneEl = this.el;

    if (!this.data.enabled || this.insideLoader || AFRAME.utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }
    if (this.enterAREl) {
      return;
    }

    // Add UI if enabled and not already present.
    this.enterAREl = createEnterARButton(this.enterAR);
    this.exitAREl = createExitARButton(this.exitAR);
    if (!document.getElementsByClassName(ENTER_VR_CLASS)[0]) {
      var wrapper = document.createElement('div');
      wrapper.classList.add(ENTER_VR_CLASS);
      wrapper.setAttribute('aframe-injected', '');
      sceneEl.appendChild(wrapper);
    }
    document.getElementsByClassName(ENTER_VR_CLASS)[0].appendChild(this.enterAREl);
    document.getElementsByClassName(ENTER_VR_CLASS)[0].appendChild(this.exitAREl);

    this.updateEnterARInterface();
  },

  remove: function remove() {
    [this.enterAREl].forEach(function (uiElement) {
      if (uiElement) {
        uiElement.parentNode.removeChild(uiElement);
      }
    });
  },

  updateEnterARInterface: function updateEnterARInterface() {
    this.toggleEnterARButtonIfNeeded();
  },

  toggleEnterARButtonIfNeeded: function toggleEnterARButtonIfNeeded() {
    var sceneEl = this.el;
    if (!this.enterAREl) {
      return;
    }
    if (sceneEl.is('vr-mode')) {
      this.enterAREl.classList.add(HIDDEN_CLASS);
      this.exitAREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterAREl.classList.remove(HIDDEN_CLASS);
      this.exitAREl.classList.remove(HIDDEN_CLASS);
    }
  }
});

/**
 * Creates a button that when clicked will enter into stereo-rendering mode for AR.
 *
 * Structure: <div><button></div>
 *
 * @param {function} enterARHandler
 * @returns {Element} Wrapper <div>.
 */
function createEnterARButton(clickHandler) {
  var arButton;

  // Create elements.
  arButton = document.createElement('button');
  arButton.className = ENTER_AR_BTN_CLASS;
  arButton.setAttribute('title', 'Enter AR mode.');
  arButton.setAttribute('aframe-injected', '');

  arButton.addEventListener('click', function (evt) {
    document.getElementsByClassName(ENTER_AR_BTN_CLASS)[0].style.display = 'none';
    document.getElementsByClassName(EXIT_AR_BTN_CLASS)[0].style.display = 'inline-block';
    clickHandler();
  });
  return arButton;
}

function createExitARButton(clickHandler) {
  var arButton;

  // Create elements.
  arButton = document.createElement('button');
  arButton.className = EXIT_AR_BTN_CLASS;
  arButton.setAttribute('title', 'Exit AR mode.');
  arButton.setAttribute('aframe-injected', '');

  arButton.addEventListener('click', function (evt) {
    document.getElementsByClassName(ENTER_AR_BTN_CLASS)[0].style.display = 'inline-block';
    document.getElementsByClassName(EXIT_AR_BTN_CLASS)[0].style.display = 'none';
    clickHandler();
  });
  return arButton;
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


AFRAME.registerComponent('xr', {
  schema: {
    vr: { default: true },
    ar: { default: true },
    magicWindow: { default: true }
  },
  init: function init() {
    this.realityChanged = this.realityChanged.bind(this);
    this.el.sceneEl.addEventListener('realityChanged', this.realityChanged);
    this.originalVisibility = this.el.getAttribute('visible');
  },
  update: function update() {
    this.originalVisibility = this.el.getAttribute('visible');
    this.el.setAttribute('visible', this.newVisibility);
  },
  realityChanged: function realityChanged(data) {
    if (this.data[data.detail] !== undefined) {
      if (!this.data[data.detail]) {
        this.newVisibility = false;
      } else {
        this.newVisibility = this.originalVisibility;
      }
      this.el.setAttribute('visible', this.newVisibility);
    }
  }
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// assumes a property
//  this.anchorOffset
// will be set, containing a WebXR XRAnchorOffset

AFRAME.registerComponent('xranchor', {
  init: function init() {
    this.anchorMatrix = new THREE.Matrix4();
    this.positionVec3 = new THREE.Vector3();
    this.rotationQuat = new THREE.Quaternion();
    this.rotationVec3 = new THREE.Vector3();
    this.el.sceneEl.addEventListener('updateFrame', this.updateFrame.bind(this));
  },

  updateFrame: function updateFrame(data) {
    var frame = data.detail;
    var anchorOffset = this.anchorOffset;

    if (!anchorOffset) {
      return;
    }
    var anchor = frame.getAnchor(anchorOffset.anchorUID);
    if (anchor === null) {
      return;
    }
    var anchorMatrix = this.anchorMatrix.fromArray(anchorOffset.getOffsetTransform(anchor.coordinateSystem));
    var positionVec3 = this.positionVec3.setFromMatrixPosition(anchorMatrix);

    this.el.setAttribute('position', {
      x: positionVec3.x,
      y: positionVec3.y,
      z: positionVec3.z
    });

    var rotationQuat = this.rotationQuat.setFromRotationMatrix(anchorMatrix);
    var rotationVec3 = this.rotationVec3.applyQuaternion(rotationQuat);

    this.el.setAttribute('rotation', {
      x: rotationVec3.x,
      y: rotationVec3.y,
      z: rotationVec3.z
    });
  }
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


AFRAME.registerComponent('reticle', {
  init: function init() {
    this.el.setAttribute('visible', false);
    this.el.sceneEl.addEventListener('updateFrame', this.updateFrame.bind(this));
    this.el.setAttribute('rotation', {
      x: -90
    });

    this.tapData = [0.5, 0.5];
    this.onTouchStart = this.onTouchStart.bind(this);
  },
  onTouchStart: function onTouchStart(ev) {
    if (!ev.touches || ev.touches.length === 0) {
      console.error('No touches on touch event', ev);
      return;
    }
    this.tapData = [ev.touches[0].clientX / window.innerWidth, ev.touches[0].clientY / window.innerHeight];
    this.el.emit('touched');
  },

  updateFrame: function updateFrame(data) {
    var frame = data.detail;
    var hit = frame.hitTestNoAnchor(this.tapData[0], this.tapData[1]);
    var model = new THREE.Matrix4();
    var tempPos = new THREE.Vector3();
    var tempQuat = new THREE.Quaternion();
    var tempScale = new THREE.Vector3();
    if (hit && hit.length > 0) {
      if (this.el.getAttribute('visible') === false) {
        this.el.setAttribute('visible', true);
        window.addEventListener('touchstart', this.onTouchStart);
      }
      model.fromArray(hit[0].modelMatrix);
      model.decompose(tempPos, tempQuat, tempScale);
      this.el.setAttribute('position', {
        x: tempPos.x,
        y: tempPos.y,
        z: tempPos.z
      });
    }
  }
});

/***/ })
/******/ ]);