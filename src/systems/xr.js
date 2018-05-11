AFRAME.registerSystem('xr', {
  schema: {
    arAutostart: { default: true },
    arLightEstimate: { default: true }
  },
  init: function () {
    this.sceneEl.setAttribute('vr-mode-ui', {enabled: false});
    this.bindMethods();
    this.sceneEl.addEventListener('loaded', this.wrapSceneMethods);
    this.lightEstimate = 1;
  },
  bindMethods: function () {
    this.updateFrame = this.updateFrame.bind(this);
    this.sessionStarted = this.sessionStarted.bind(this);
    this.sessionEnded = this.sessionEnded.bind(this);
    this.poseLost = this.poseLost.bind(this);
    this.poseFound = this.poseFound.bind(this);
    this.wrapSceneMethods = this.wrapSceneMethods.bind(this);
  },
  wrapSceneMethods: function () {
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

  cameraActivated: function () {
    var self = this;
    this.el.emit('realityChanged', 'magicWindow');
    THREE.WebXRUtils.getDisplays().then(self.initXR.bind(self));
  },

  initXR: function (displays) {
    var sceneEl = this.sceneEl;
    sceneEl.renderer.autoClear = false;

    this.supportAR = false;
    for (var i = 0; i < displays.length; i++) {
      var display = displays[i];
      if (display.supportedRealities.ar) {
        this.supportAR = true;
      }
    }

    var options = {
      // Flag to start AR if is the unique display available.
      AR_AUTOSTART: this.data.arAutostart // Default: true
    }
    sceneEl.renderer.xr = new THREE.WebXRManager(options, displays, sceneEl.renderer, sceneEl.camera, sceneEl.object3D, this.updateFrame);
    sceneEl.renderer.xr.addEventListener('sessionStarted', this.sessionStarted);
    sceneEl.renderer.xr.addEventListener('sessionEnded', this.sessionEnded);

    sceneEl.renderer.xr.addEventListener('poseLost', this.poseLost);
    sceneEl.renderer.xr.addEventListener('poseFound', this.poseFound);

    if (sceneEl.renderer.xr.totalSupportedDisplays === 0) {
      this.sceneEl.setAttribute('vr-mode-ui', {enabled: true});
      // this.sceneEl.setAttribute('ar-mode-ui', {enabled: true});
    } else {
      if (!sceneEl.renderer.xr.autoStarted) {
        this.addEnterButtons(displays);
      }
    }

    this.el.emit('xrInitialized');
  },

  // NOW it only supports one VR and one AR display
  // TODO support more than two displays simultaneously
  addEnterButtons: function (displays) {
    for (var i = 0; i < displays.length; i++) {
      var display = displays[i];
      if (display.supportedRealities.vr) {
        this.lastVRDisplay = display;
        this.sceneEl.setAttribute('vr-mode-ui', {enabled: true});
      }
      if (display.supportedRealities.ar) {
        this.lastARDisplay = display;
        this.sceneEl.setAttribute('ar-mode-ui', {enabled: true});
      }
    }
  },
  sessionStarted: function (data) {
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

  sessionEnded: function (data) {
    this.activeRealityType = 'magicWindow';
    this.el.emit('realityChanged', this.activeRealityType);
    if (this.activeRealityType === 'ar') {
      // To show camera on iOS devices
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }
  },

  poseLost: function () {
    this.el.emit('poseLost');
  },

  poseFound: function () {
    this.el.emit('poseFound');
  },
  update: function () {
    if (this.data.arLightEstimate) {
      this.lightsArray = this.el.sceneEl.querySelectorAll('[light]');
      var self = this;
      this.lightsArrayInterval = setInterval(
        function () {
          self.lightsArray = self.el.sceneEl.querySelectorAll('[light]');
        },
        2000
      );
    } else {
      if (this.lightsArrayInterval) {
        clearInterval(this.lightsArrayInterval);
      }
    }
  },
  updateFrame: function (frame) {
    this.el.emit('updateFrame', frame);
    // Custom code for each frame rendered
    if (frame.hasLightEstimate && this.data.arLightEstimate) {
      for (let i = 0; i < this.lightsArray.length; i++) {
        var element = this.lightsArray[i];
        if (!element.getObject3D('light').originalIntensity) {
          element.getObject3D('light').originalIntensity = element.getAttribute('light').intensity;
        }
        this.lightEstimate = frame.lightEstimate;
        element.setAttribute('light', 'intensity', element.getObject3D('light').originalIntensity * frame.lightEstimate);
      }
    }
    if (this.activeRealityType === 'ar') {
      this.sceneEl.delta = this.sceneEl.clock.getDelta() * 1000;
      this.sceneEl.time = this.sceneEl.clock.elapsedTime * 1000;
      if (this.sceneEl.isPlaying) {
        this.sceneEl.tick(this.sceneEl.time, this.sceneEl.delta);
      }
    }
  }
});