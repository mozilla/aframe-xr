AFRAME.registerComponent('xr', {
  schema: {
    vr: { default: true },
    ar: { default: true },
    magicWindow: { default: true }
  },
  init: function () {
    this.realityChanged = this.realityChanged.bind(this);
    this.el.sceneEl.addEventListener('realityChanged', this.realityChanged);
    this.originalVisibility = this.el.getAttribute('visible');
  },
  update: function (){
    this.originalVisibility = this.el.getAttribute('visible');
    this.el.setAttribute('visible', this.newVisibility);
  },
  realityChanged: function (data) {
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