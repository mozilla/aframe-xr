
AFRAME.registerComponent('reticle', {
  init: function () {
    this.el.sceneEl.addEventListener(
      'updateFrame',
      this.updateFrame.bind(this)
    );
    this.el.setAttribute('rotation', {
      x: -90
    });
  },

  updateFrame: function (data) {
    var frame = data.detail;
    var hit = frame.hitTestNoAnchor(0.5, 0.5);
    var model = new THREE.Matrix4();
    var tempPos = new THREE.Vector3();
    var tempQuat = new THREE.Quaternion();
    var tempScale = new THREE.Vector3();
    if (hit && hit.length > 0) {
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
