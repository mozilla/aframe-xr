// assumes a property
//  this.anchorOffset
// will be set, containing a WebXR XRAnchorOffset

AFRAME.registerComponent('xranchor', {
  init: function () {
    this.anchorMatrix = new THREE.Matrix4();
    this.positionVec3 = new THREE.Vector3();
    this.rotationQuat = new THREE.Quaternion();
    this.el.sceneEl.addEventListener(
      'updateFrame',
      this.updateFrame.bind(this)
    );
  },

  updateFrame: function (data) {
    var frame = data.detail;
    var anchorOffset = this.anchorOffset;

    if (!anchorOffset) {
      return;
    }
    var anchor = frame.getAnchor(anchorOffset.anchorUID);
    if (anchor === null) {
      return;
    }
    var anchorMatrix = this.anchorMatrix.fromArray(
      anchorOffset.getOffsetTransform(anchor.coordinateSystem)
    );
    var positionVec3 = this.positionVec3.setFromMatrixPosition(anchorMatrix);
    this.el.object3D.position.copy(positionVec3);

    var rotationQuat = this.rotationQuat.setFromRotationMatrix(anchorMatrix);
    this.el.object3D.quaternion.copy(rotationQuat);
  }
});
