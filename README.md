# sakitam-map

> a lite javascript map lib

[![Build Status](https://travis-ci.org/sakitam-gis/sakitam-map.svg?branch=master)](https://www.travis-ci.org/sakitam-gis/sakitam-map)
[![NPM downloads](https://img.shields.io/npm/dm/@sakitam-gis/sakitam-map.svg)](https://npmjs.org/package/@sakitam-gis/sakitam-map)
![JS gzip size](http://img.badgesize.io/https://unpkg.com/@sakitam-gis/sakitam-map/dist/sakitam-map.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/@sakitam-gis/sakitam-map.svg)](https://www.npmjs.org/package/@sakitam-gis/sakitam-map)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-gis/sakitam-map.svg)](https://github.com/sakitam-gis/sakitam-map/stargazers) [![Greenkeeper badge](https://badges.greenkeeper.io/sakitam-gis/sakitam-map.svg)](https://greenkeeper.io/)

## 下载


```bash
git clone https://github.com/sakitam-gis/sakitam-map.git
npm install
npm run dev
npm run build
```

### 安装

#### npm安装

```bash
npm install @sakitam-gis/sakitam-map --save
import smap from '@sakitam-gis/sakitam-map'
```

#### cdn

目前可通过 [unpkg.com](https://unpkg.com/@sakitam-gis/sakitam-map/dist/sakitam-map.js) / [jsdelivr](https://cdn.jsdelivr.net/npm/@sakitam-gis/sakitam-map/dist/sakitam-map.js) 获取最新版本的资源。

```bash
// jsdelivr (jsdelivr由于缓存原因最好锁定版本号，否则可能会出现意料之外的问题)
https://cdn.jsdelivr.net/npm/@sakitam-gis/sakitam-map/dist/sakitam-map.js
https://cdn.jsdelivr.net/npm/@sakitam-gis/sakitam-map/dist/sakitam-map.min.js
// npm
https://unpkg.com/@sakitam-gis/sakitam-map/dist/sakitam-map.js
https://unpkg.com/@sakitam-gis/sakitam-map/dist/sakitam-map.min.js
```

### use

```html
<div id="map"></div>
<script src="https://unpkg.com/@sakitam-gis/sakitam-map/dist/sakitam-map.js"></script>
<script type="text/javascript">
  var map = new smap.Map('map', {
    projection: 'EPSG:3857',
    zoom: 5,
    center: [12673975, 4079823]
  });

  map.on('load', function (event, data) {
    console.log(event, data)
  });

  var layer = new smap.layer.TileLayer({
    url: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
  });
  map.addLayer(layer);

  document.onkeydown = function (event) {
    console.log(event)
    if (event.keyCode === 107) { // +
      map.setZoom(map.getZoom() + 1)
    } else if (event.keyCode === 109) { // -
      map.setZoom(map.getZoom() - 1)
    }
  };

  var drag = new smap.interactions.DragPan();
  var zoom = new smap.interactions.WheelZoom();
  var dbclick = new smap.interactions.DoubleClickZoom();
  map.addInteraction(dbclick);
  map.addInteraction(zoom);
  map.addInteraction(drag);
</script>
```
