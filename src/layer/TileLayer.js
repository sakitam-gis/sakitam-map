import Base from './Base';
import Tile from './tile/Tile'
import { get } from '../proj'

class TileLayer extends Base {
  constructor (options = {}) {
    super(options);

    this.map = null;

    /**
     * layer projection
     */
    this.projection = get(options['projection'] || 'EPSG:3857');

    /**
     * is can cross origin
     * @type {boolean}
     */
    this.crossOrigin = !!options.crossOrigin;

    /**
     * layer extent
     * @type {*|*[]}
     */
    this.extent = options['extent'] || this.projection.getExtent();

    /**
     * tile origin
     * @type {*}
     */
    this.origin = options.origin || [this.extent[0], this.extent[3]]; // left top

    /**
     * tile size
     * @type {*|number[]}
     */
    this.tileSize = options['tileSize'] || [256, 256];

    /**
     * layer service url
     * @type {*|string}
     */
    this.url = options['url'] || '';

    /**
     * layer opacity
     * @type {*|number}
     */
    this.opacity = options['opacity'] || 1;

    /**
     * layer zIndex
     * @type {*|number}
     */
    this.zIndex = options['zIndex'] || 0;

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
      for (let i = 0; i < this.tiles.length; i++) {
        const tile = this.tiles[i];
        const context = this.getMap().getContext();
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
        const url = this.url.replace('{z}', params['zoom']).replace('{x}', x).replace('{y}', y);
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

  zoomify () {
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    this.map = map;
  }

  /**
   * get map
   * @returns {*}
   */
  getMap () {
    return this.map;
  }
}

export default TileLayer
