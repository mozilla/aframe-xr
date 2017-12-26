# aframe-xr

[![Version](http://img.shields.io/npm/v/aframe-xr.svg?style=flat-square)](https://npmjs.org/package/aframe-xr)
[![License](http://img.shields.io/npm/l/aframe-xr.svg?style=flat-square)](https://npmjs.org/package/aframe-xr)

System &amp; components to build [WebXR](https://github.com/mozilla/webxr-api) experiences with [A-frame](https://github.com/aframevr/aframe)

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

## Configuration

```html
<a-scene>
  <a-entity xr="ar: true; vr: false; magicWindow: false"></a-entity>
  <!-- ... -->
</a-scene>
```

## Documentation

### xr System

| Property                        | Default | Description                                          |
|---------------------------------|---------|------------------------------------------------------|
| AR_AUTOSTART                    | true    | Start AR if is the unique display available          |

### xr Component

| Property                        | Default | Description                                          |
|---------------------------------|---------|------------------------------------------------------|
| ar                              | true    | If the entity is visible on AR mode                  |
| magicWindow                     | true    | If the entity is visible on magic window mode        |
| vr                              | true    | If the entity is visible on VR mode                  |

### ar-mode-ui Component

Based on the [vr-mode-ui](https://github.com/aframevr/aframe/blob/v0.7.0/src/components/scene/vr-mode-ui.js) component

| Property                        | Default | Description                                          |
|---------------------------------|---------|------------------------------------------------------|
| enabled                         | true    | Whether or not to display UI related to entering AR. |

## Usage

### Browser
Include three.xr.js &amp; aframe-xr after A-frame (For now, we are using master version. Soon an official published version):
```html
<script src="../../../vendor/aframe-master.js"></script>
<script src='aframe-xr.js'></script>
```

#### npm

Install via npm:

```bash
npm install aframe-xr
```

Then require and use.

```js
require('aframe');
require('aframe-xr');
```