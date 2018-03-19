import Base from './Base';
import Tile from '../render/canvas/Tile'

class TileLayer extends Base {
  constructor (options = {}) {
    super(options);

    this.map = null;

    /**
     * is can cross origin
     * @type {boolean}
     */
    this.crossOrigin = !!options.crossOrigin;

    /**
     * tile origin
     * @type {*}
     */
    this.origin = options.origin || [0, 0];

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
     * 切片缓存
     * @type {Array}
     */
    this.tiles = [];

    /**
     * layer extent
     * @type {*|*[]}
     */
    this.extent = options['extent'] || [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892];
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
        if (tile.isLoaded()) {
          console.log(tile)
          context.drawImage(tile.getImage(), 0, 0, this.tileSize[0], this.tileSize[1], tile.getOffset()[0], tile.getOffset()[1], this.tileSize[0] / this.scale, this.tileSize[1] / this.scale);
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
    this.level = z;
    let tileLeft = Math.floor((this.extent[0] - this.origin[0]) / this.tileSize[0] / this.resolution);
    let tileRight = Math.ceil((this.extent[2] - this.origin[0]) / this.tileSize[0] / this.resolution) - 1;
    let tileTop = Math.floor((this.origin[1] - this.extent[3]) / this.tileSize[1] / this.resolution);
    let tileBottom = Math.ceil((this.origin[1] - this.extent[1]) / this.tileSize[1] / this.resolution) - 1;
    this.tileExtent = [tileLeft, tileTop, tileRight, tileBottom];
    this.scale = resolution / this.resolution;
  }

  /**
   * get tiles list
   * @param params
   * @returns {Array}
   */
  getTilesInternal (params = {}) {
    const _tiles = [];
    for (let i = params.extent[0]; i <= params.extent[2]; ++i) {
      for (let j = params.extent[1]; j <= params.extent[3]; ++j) {
        const url = this.url.replace('{z}', params['level']).replace('{x}', i).replace('{y}', j);
        let xmin = i * this.tileSize[0] * params['resolution'] + this.origin[0];
        let ymax = this.origin[1] - j * this.tileSize[1] * params['resolution'];
        _tiles.push(new Tile(url, i, j, this.level, xmin, ymax, this, this.crossOrigin));
      }
    }
    return _tiles;
  }

  /**
   * get params
   * @returns {{extent: *[], level: *, resolution: *}}
   */
  getParams () {
    const extent = this.getMap().getExtent();
    let tileLeft = Math.floor((extent[0] - this.origin[0]) / this.tileSize[0] / this.resolution);
    let tileRight = Math.ceil((extent[2] - this.origin[0]) / this.tileSize[0] / this.resolution) - 1;
    let tileTop = Math.floor((this.origin[1] - extent[3]) / this.tileSize[1] / this.resolution);
    let tileBottom = Math.ceil((this.origin[1] - extent[1]) / this.tileSize[1] / this.resolution) - 1;
    tileLeft = tileLeft < this.tileExtent[0] ? this.tileExtent[0] : tileLeft;
    tileRight = tileRight > this.tileExtent[2] ? this.tileExtent[2] : tileRight;
    tileTop = tileTop < this.tileExtent[1] ? this.tileExtent[1] : tileTop;
    tileBottom = tileBottom > this.tileExtent[3] ? this.tileExtent[3] : tileBottom;
    return {
      extent: [tileLeft, tileTop, tileRight, tileBottom],
      level: this.level,
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
