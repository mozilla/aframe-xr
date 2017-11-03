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


AFRAME.registerSystem('xr', {
  schema: {
    reality: { default: 'ar' }
  },

  init: function init() {
    this.posePosition = new THREE.Vector3();
    this.poseQuaternion = new THREE.Quaternion();
    this.poseEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.poseRotation = new THREE.Vector3();
    this.poseIsLost = true;

    var self = this;
    this.sceneEl.addEventListener('loaded', this.wrapSceneMethods.bind(this));

    if (this.el.camera) {
      this.cameraActivated();
    } else {
      this.el.addEventListener('camera-set-active', function (evt) {
        self.cameraActivated();
      });
    }
  },

  wrapSceneMethods: function wrapSceneMethods() {
    var sceneEl = this.sceneEl;

    sceneEl.enterVR = function () {
      this.renderer.xr.startPresenting();
    };

    sceneEl.exitVR = function () {
      this.renderer.xr.stopPresenting();
    };

    sceneEl.resize = function () {
      if (this.renderer.xr && !this.renderer.xr.sessionActive) {
        // Update camera.
        var camera = this.camera;
        var canvas = this.canvas;
        var embedded = this.getAttribute('embedded') && !this.is('vr-mode');
        // var size = this.getCanvasSize(canvas, embedded);
        var size = {
          height: window.innerHeight,
          width: window.innerWidth
        };
        if (embedded) {
          size.height = canvasEl.parentElement.offsetHeight;
          size.width = canvasEl.parentElement.offsetWidth;
        }
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        // Notify renderer of size change.
        this.renderer.setSize(size.width, size.height, false);
      }
    };

    sceneEl.render = function () {
      var delta = this.clock.getDelta() * 1000;
      var renderer = this.renderer;
      this.time = this.clock.elapsedTime * 1000;

      if (this.isPlaying) {
        this.tick(this.time, delta);
      }
      renderer.animate(this.render.bind(this));
      if (this.renderer.xr && (!this.renderer.xr.session || this.renderer.xr.session && !this.renderer.xr.sessionActive)) {
        renderer.render(this.object3D, this.camera, this.renderTarget);
      }

      if (this.isPlaying) {
        this.tock(this.time, delta);
      }
    };
  },

  cameraActivated: function cameraActivated() {
    this.defaultPosition = new THREE.Vector3(0, 1.6, 0.1);
    this.el.camera.el.setAttribute('position', this.defaultPosition);

    if (this.data.reality !== 'vr') {
      this.sceneEl.setAttribute('vr-mode-ui', { enabled: false });
    }

    this.updateFrame = this.updateFrame.bind(this);

    var self = this;
    THREE.WebXRUtils.getDisplays().then(self.xrConnected.bind(self));
  },

  xrConnected: function xrConnected(displays) {
    var sceneEl = this.sceneEl;
    sceneEl.renderer.autoClear = false;

    // To show camera on iOS devices
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    sceneEl.renderer.xr = new THREE.WebXRManager(displays, sceneEl.renderer, sceneEl.camera, sceneEl.object3D, this.updateFrame);
    if (this.data.reality === 'vr') {
      sceneEl.renderer.xr.startSession(true, false);
    } else {
      sceneEl.renderer.xr.startSession(false, true);
    }
  },

  updateFrame: function updateFrame(frame) {
    // Custom code for each frame rendered
  }
});

/***/ })
/******/ ]);