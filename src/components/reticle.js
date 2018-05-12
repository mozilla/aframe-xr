
AFRAME.registerComponent('reticle', {
  init: function () {
    this.el.setAttribute('visible', false);
    this.el.sceneEl.addEventListener(
      'updateFrame',
      this.updateFrame.bind(this)
    );
    this.el.setAttribute('rotation', {
      x: -90
    });
    this.el.object3D.updateMatrix()
    this.extraRotation = new THREE.Quaternion()
    this.extraRotation.setFromRotationMatrix(this.el.object3D.matrix);

    this.tapData = [0.5, 0.5];
    this.onTouchStart = this.onTouchStart.bind(this);
    this.model = new THREE.Matrix4();
    this.tempPos = new THREE.Vector3();
    this.tempQuat = new THREE.Quaternion();
    this.tempScale = new THREE.Vector3();
  },
  onTouchStart: function (ev) {
    if (!ev.touches || ev.touches.length === 0) {
      console.error('No touches on touch event', ev);
      return;
    }
    this.tapData = [
      ev.touches[0].clientX / window.innerWidth,
      ev.touches[0].clientY / window.innerHeight
    ];
    this.el.emit('touched', ev);
  },

  updateFrame: function (data) {
    var frame = data.detail;
    var hit = frame.hitTestNoAnchor(this.tapData[0], this.tapData[1]);
    if (hit && hit.length > 0) {
      if (this.el.getAttribute('visible') === false) {
        this.el.setAttribute('visible', true);
        this.el.emit('planeDetected');
        window.addEventListener('touchstart', this.onTouchStart);
      }
      this.model.fromArray(hit[0].modelMatrix);
      this.model.decompose(this.tempPos, this.tempQuat, this.tempScale);
      this.el.object3D.position.copy(this.tempPos);
      this.tempQuat.multiply(this.extraRotation)
      this.el.object3D.quaternion.copy(this.tempQuat);
    }
  }
});
