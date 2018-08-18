// assumes a property
//  this.anchorOffset
// will be set, containing a WebXR XRAnchorOffset

AFRAME.registerComponent('xranchor', {
  schema: {
    positionOffset: { default: 'vec3' }
  },

  init: function () {
    this.anchorMatrix = new THREE.Matrix4();
    this.positionVec3 = new THREE.Vector3();
    this.rotationQuat = new THREE.Quaternion();
    this.rotationVec3 = new THREE.Vector3();
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

    this.el.setAttribute('position', {
      x: positionVec3.x + this.data.positionOffset.x,
      y: positionVec3.y + this.data.positionOffset.y,
      z: positionVec3.z + this.data.positionOffset.z
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
