import Base from './Base';
import Tile from './tile/Tile';
import { isFunction } from '../utils';
// import { overlaps, intersect } from '../proj/extent';

class TileLayer extends Base {
  constructor (options = {}) {
    super(options);

    /**
     * layer service url
     * @type {*|string}
     */
    this.url = options['url'] || '';

    /**
     * tile size
     * @type {*|number[]}
     */
    this.tileSize = options['tileSize'] || [256, 256];

    /**
     * 切片缓存
     * @type {Array}
     */
    this.tiles = [];
  }

  load () {
    if (!this.getMap()) {
      return this;
    }
    this.render();
    return this;
  }

  render () {
    if (this.getMap()) {
      const context = this.getMap().getContext();
      this.tiles = this._getTiles();
      for (let i = 0; i < this.tiles.length; i++) {
        const tile = this.tiles[i];
        tile.un('load', this.render, this);
        tile.on('load', this.render, this);
        if (tile.isLoaded()) {
          context.drawImage(tile.getImage(), 0, 0, this.tileSize[0], this.tileSize[1], tile.getTileOffset()[0], tile.getTileOffset()[1], this.tileSize[0] / this.scale, this.tileSize[1] / this.scale);
        }
      }
    }
  }

  /**
   * get tiles
   * @returns {Array}
   * @private
   */
  _getTiles () {
    const map = this.getMap();
    const size = map.getSize();
    const center = map.getCenter();
    const mapResolution = map.getResolution();
    const resolutions = map.getResolutions();
    const zoom = this._getNearestZoom(true);
    const layerResolution = resolutions[zoom];
    const scale = layerResolution / mapResolution;
    const scaledTileSize = [this.tileSize[0] * scale, this.tileSize[1] * scale];
    const width = Math.abs(size[0] * Math.cos(0)) + Math.abs(size[1] * Math.sin(0));
    const height = Math.abs(size[0] * Math.sin(0)) + Math.abs(size[1] * Math.cos(0));
    const centerTile = this._getTileIndex(center[0], center[1], zoom);
    let tileLeft = centerTile[0] - Math.ceil(width / scaledTileSize[0] / 2);
    let tileRight = centerTile[0] + Math.ceil(width / scaledTileSize[0] / 2);
    let tileBottom = centerTile[1] - Math.ceil(height / scaledTileSize[1] / 2);
    let tileTop = centerTile[1] + Math.ceil(height / scaledTileSize[1] / 2);
    const _tiles = [];
    for (let i = tileLeft; i <= tileRight; i++) {
      for (let j = tileBottom; j <= tileTop; j++) {
        const tileExtent = [
          this.origin[0] + i * this.tileSize[0] * layerResolution,
          this.origin[1] - (j + 1) * this.tileSize[1] * layerResolution,
          this.origin[0] + (i + 1) * this.tileSize[0] * layerResolution,
          this.origin[1] - j * this.tileSize[1] * layerResolution
        ];
        // if (!overlaps(tileExtent, intersect(this.getExtent(), map.getExtent()), -Math.max(1e-5, mapResolution / 10))) {
        //   continue;
        // }
        const url = this._getTileUrl(i, j, zoom);
        // _tiles.push({
        //   z: zoom,
        //   x: i,
        //   y: j,
        //   url,
        //   size: scaledTileSize,
        //   extent: tileExtent,
        //   resolution: layerResolution
        // });
        _tiles.push(new Tile(url, i, j, zoom, tileExtent[0], tileExtent[3], this, this.crossOrigin))
      }
    }
    return _tiles;
  }

  /**
   * get tile show extent
   * @param idxX
   * @param idxY
   * @param zoom
   * @returns {*[]}
   * @private
   */
  _getTileExtent (idxX, idxY, zoom) {
    const map = this.getMap();
    const resolutions = map.getResolutions();
    const resolution = Number(resolutions[zoom]);
    if (!resolution) {
      return [];
    }
    const dx = this.tileSize[0] * resolution * idxX;
    const dy = this.tileSize[1] * resolution * idxY;
    const x = dx + this.origin[0];
    const y = this.origin[1] - dy;
    return [x, y - this.tileSize[1] * resolution, x + this.tileSize[0] * resolution, y];
  }

  /**
   * get tile index
   * @param x
   * @param y
   * @param zoom
   * @returns {*[]}
   * @private
   */
  _getTileIndex (x, y, zoom) {
    const map = this.getMap();
    const resolutions = map.getResolutions();
    const resolution = Number(resolutions[zoom]);
    if (!resolution) {
      return [-1, -1];
    }
    const dx = x - this.origin[0];
    const dy = this.origin[1] - y;
    return [Math.floor(dx / this.tileSize[0] * resolution), Math.floor(dy / this.tileSize[1] * resolution)];
  }

  /**
   * get each tile url
   * @param idxX
   * @param idxY
   * @param zoom
   * @returns {*}
   * @private
   */
  _getTileUrl (idxX, idxY, zoom) {
    if (isFunction(this.url)) {
      return this.url(zoom, idxX, idxY);
    } else {
      return this.url.replace('{z}', zoom).replace('{x}', idxX).replace('{y}', idxY);
    }
  }

  /**
   * get current nearest zoom
   * @param greater
   * @returns {number}
   * @private
   */
  _getNearestZoom (greater) {
    const map = this.getMap();
    const resolution = map.getResolution();
    const resolutions = map.getResolutions();
    let [newResolution, lastZoom] = [undefined, 0]
    for (let i = 0, length = resolutions.length; i < length; i++) {
      newResolution = resolutions[i];
      if (resolution > newResolution) {
        return greater ? i : lastZoom;
      } else if (resolution <= newResolution && resolution > newResolution) {
        return i;
      } else {
        lastZoom = i;
      }
    }
    return 0;
  }
}

export default TileLayer
