AFRAME.registerSystem('xr', {
  schema: {
    reality: { default: 'ar' }
  },

  init: function () {
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

  wrapSceneMethods: function () {
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

      if (this.isPlaying) { this.tick(this.time, delta); }
      renderer.animate(this.render.bind(this));
      if (this.renderer.xr && (!this.renderer.xr.session ||this.renderer.xr.session && !this.renderer.xr.sessionActive)) {
        renderer.render(this.object3D, this.camera, this.renderTarget);
      }

      if (this.isPlaying) { this.tock(this.time, delta); }
    };
  },

  cameraActivated: function () {
    this.defaultPosition = new THREE.Vector3(0, 1.6, 0.1);
    this.el.camera.el.setAttribute('position', this.defaultPosition);

    if (this.data.reality !== 'vr') {
      this.sceneEl.setAttribute('vr-mode-ui', {enabled: false});
    }

    this.updateFrame = this.updateFrame.bind(this);

    var self = this;
    THREE.WebXRUtils.getDisplays().then(self.xrConnected.bind(self));
  },

  xrConnected: function (displays) {
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
  
  updateFrame: function (frame) {
    // Custom code for each frame rendered
  }
});
