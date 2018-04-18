import Base from './Base';
import Tile from './tile/Tile'
import { isFunction } from '../utils'
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
    this.rerender();
    this.tiles = this.getTilesInternal(this.getParams());
    this.render();
    return this;
  }

  render () {
    if (this.getMap()) {
      const context = this.getMap().getContext();
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

  rerender () {
    const resolution = this.getMap().getResolution();
    const resolutions = this.getMap().getResolutions();
    let z = 0;
    for (let i = 0; i < resolutions.length; i++) {
      if (resolution >= resolutions[i]) {
        z = i + 1;
        this.resolution = resolutions[i] || 0;
        break;
      }
    }
    this.zoom = z;
    let tileLeft = Math.floor((this.extent[0] - this.origin[0]) / this.tileSize[0] / this.resolution);
    let tileRight = Math.ceil((this.extent[2] - this.origin[0]) / this.tileSize[0] / this.resolution) - 1;
    let tileTop = Math.ceil((this.origin[1] - this.extent[1]) / this.tileSize[1] / this.resolution) - 1;
    let tileBottom = Math.floor((this.origin[1] - this.extent[3]) / this.tileSize[1] / this.resolution);
    this.tileRange = [tileLeft, tileBottom, tileRight, tileTop];
    this.scale = resolution / this.resolution;
  }

  /**
   * get tiles list
   * @param params
   * @returns {Array}
   */
  getTilesInternal (params = {}) {
    const _tiles = [];
    for (let x = params.tileRange[0]; x <= params.tileRange[2]; ++x) {
      for (let y = params.tileRange[1]; y <= params.tileRange[3]; ++y) {
        const url = this._getTileUrl(x, y, params['zoom']);
        let xmin = x * this.tileSize[0] * params['resolution'] + this.origin[0];
        let ymax = this.origin[1] - y * this.tileSize[1] * params['resolution'];
        _tiles.push(new Tile(url, x, y, this.zoom, xmin, ymax, this, this.crossOrigin));
      }
    }
    return _tiles;
  }

  /**
   * get params
   * @returns {{tileRange: *[], zoom: *, resolution: *}}
   */
  getParams () {
    const extent = this.getMap().getExtent();
    let tileLeft = Math.floor((extent[0] - this.origin[0]) / this.tileSize[0] / this.resolution);
    let tileRight = Math.ceil((extent[2] - this.origin[0]) / this.tileSize[0] / this.resolution) - 1;
    let tileTop = Math.ceil((this.origin[1] - extent[1]) / this.tileSize[1] / this.resolution) - 1;
    let tileBottom = Math.floor((this.origin[1] - extent[3]) / this.tileSize[1] / this.resolution);
    tileLeft = tileLeft < this.tileRange[0] ? this.tileRange[0] : tileLeft;
    tileRight = tileRight > this.tileRange[2] ? this.tileRange[2] : tileRight;
    tileTop = tileTop < this.tileRange[1] ? this.tileRange[1] : tileTop;
    tileBottom = tileBottom > this.tileRange[3] ? this.tileRange[3] : tileBottom;
    return {
      tileRange: [tileLeft, tileBottom, tileRight, tileTop],
      zoom: this.zoom,
      resolution: this.resolution
    }
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
