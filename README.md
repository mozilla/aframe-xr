# aframe-xr

[![Version](http://img.shields.io/npm/v/aframe-xr.svg?style=flat-square)](https://npmjs.org/package/aframe-xr)
[![License](http://img.shields.io/npm/l/aframe-xr.svg?style=flat-square)](https://npmjs.org/package/aframe-xr)

System to build [WebXR](https://github.com/mozilla/webxr-api) experiences with [A-frame](https://github.com/aframevr/aframe)

## System configuration

```html
<a-scene xr="reality: vr">
  <!-- ... -->
</a-scene>
```

| Property                        | Default | Description                                        |
|---------------------------------|---------|----------------------------------------------------|
| reality                          | ar   | [`ar`, `vr`]                                         |


## Running the examples
<a href="https://docs.npmjs.com/getting-started/installing-node">Install npm</a> and then run the following:

```
$ npm install
$ npm start
```

## Supported browsers

### AR

  - ARKit: Mozilla's [ARKit based iOS app](https://github.com/mozilla/webxr-ios)
  - ARCore: Google's [WebARonARCore Android app](https://github.com/google-ar/WebARonARCore)

### VR

  - Daydream: [Chrome for Android](https://webvr.rocks/chrome_for_android)
  - Gear VR: [Oculus Browser](https://webvr.rocks/oculus_browser)
  - HTC Vive / Oculus Rift: [Firefox](https://webvr.rocks/firefox)
  - Windows Mixed Reality: [Microsoft Edge](https://webvr.rocks/microsoft_edge)

## Usage

Include three.xr.js &amp; aframe-xr after A-frame (For now, a custom version. Soon an official version):
```html
<script src="../../../vendor/aframe-v0.7.1.js"></script>
<script src='https://cdn.jsdelivr.net/npm/three.xr.js/dist/three.xr.js'></script>
<script src='../../../dist/aframe-xr.js'></script>
```