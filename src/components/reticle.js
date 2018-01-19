
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

    this.tapData = [0.5, 0.5];
    this.onTouchStart = this.onTouchStart.bind(this);
  },
  onTouchStart: function (ev) {
    if (!ev.touches || ev.touches.length === 0) {
      console.error('No touches on touch event', ev);
      return
    }
    this.tapData = [
      ev.touches[0].clientX / window.innerWidth,
      ev.touches[0].clientY / window.innerHeight
    ];
    this.el.emit('touched');
  },

  updateFrame: function (data) {
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
      })
    }
  }
});
