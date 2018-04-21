import Base from './Base';
import Tile from './tile/Tile';
import { isFunction } from '../utils';
import { overlaps } from '../proj/extent';

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

  /**
   * load layer
   * @returns {TileLayer}
   */
  load () {
    if (!this.getMap()) {
      return this;
    }
    this.render();
    return this;
  }

  /**
   * re render
   */
  render () {
    const map = this.getMap();
    const size = map.getSize();
    const center = map.getCenter();
    const resolutions = map.getResolutions();
    const zoom = this._getNearestZoom(false);
    const layerResolution = resolutions[zoom];
    let tiles = this._getTilesInternal();
    this.setExtent([
      center[0] - size[0] * layerResolution / 2,
      center[1] - size[1] * layerResolution / 2,
      center[0] + size[0] * layerResolution / 2,
      center[1] + size[1] * layerResolution / 2
    ]);
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const tileResolution = resolutions[tile.z];
      if (tile.z !== zoom) {
        // self._stopLoadingTile(tile);
        //
        // if (!options.keepResample || options.opacity < 1) {
        //   self._removeTile(key);
        // }
      }
      const tileExtent = [
        this.origin[0] + tile.x * this.tileSize[0] * tileResolution,
        this.origin[1] - (tile.y + 1) * this.tileSize[1] * tileResolution,
        this.origin[0] + (tile.x + 1) * this.tileSize[0] * tileResolution,
        this.origin[1] - tile.y * this.tileSize[1] * tileResolution
      ];
      if (!overlaps(tileExtent, this.getExtent())) {
        tiles = tiles.filter(_item => _item['id'] !== (tile['z'] + ',' + tile['y'] + ',' + tile['x']))
      }
    }
    const centerTile = this._getTileIndex(center[0], center[1], zoom);
    this._sortTiles(tiles, centerTile);
    const loadTiles_ = this._getTiles(tiles);
    const context = map.getContext();
    context.save();
    context.globalAlpha = this.getOpacity();
    for (let i = 0; i < loadTiles_.length; i++) {
      this._drawTile(loadTiles_[i], context)
    }
    context.restore();
  }

  /**
   * draw tile
   * @param tile
   * @param context
   * @private
   */
  _drawTile (tile, context) {
    if (!tile.isLoaded()) {
      return;
    }
    const map = this.getMap();
    const mapExtent = map.getExtent();
    const resolution = map.getResolution();
    const resolutions = map.getResolutions();
    const zoom = this._getNearestZoom(false);
    const layerResolution = resolutions[zoom];
    let x = this.origin[0] + parseInt(tile['x']) * this.tileSize[0] * layerResolution;
    let y = this.origin[1] - parseInt(tile['y']) * this.tileSize[1] * layerResolution;
    let [width, height] = [
      Math.ceil(this.tileSize[0] * layerResolution / resolution),
      Math.ceil(this.tileSize[1] * layerResolution / resolution)
    ];
    let [idxMax, idxMin] = [0, 0];
    const mapWidth = mapExtent[2] - mapExtent[0];
    for (let i = idxMin; i <= idxMax; i++) {
      let pixel = map.getPixelFromCoordinate([x + i * mapWidth, y]);
      let [pixelX, pixelY] = [pixel[0], pixel[1]];
      try {
        context.drawImage(tile.getImage(), Math.round(pixelX), Math.round(pixelY), width, height);
      } catch (e) {
      }
    }
  }

  /**
   * get tile
   * @param tiles
   * @returns {Array}
   * @private
   */
  _getTiles (tiles) {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const existTiles = this.tiles.filter(_tile => _tile.id === tile['id']);
      if (tile['id'] && existTiles.length > 0 && existTiles[0].url === existTiles[0].getErrorTile()) {
        existTiles[0].setOptions({
          x: tile.x,
          y: tile.y,
          z: tile.z,
          id: tile.id,
          url: tile.url
        });
      } else {
        this.tiles.push(new Tile(tile.url, tile.x, tile.y, tile.z, tile.id, this));
      }
    }
    return this.tiles;
  }

  /**
   * sort tiles
   * @param tiles
   * @param centerTile
   * @private
   */
  _sortTiles (tiles, centerTile) {
    tiles.sort((a, b) => {
      let indexX = Math.pow((a[0] - centerTile[0]), 2) + Math.pow((a[1] - centerTile[1]), 2);
      let indexY = Math.pow((b[0] - centerTile[0]), 2) + Math.pow((b[1] - centerTile[1]), 2);
      return Math.abs(indexX - indexY);
    });
  }

  /**
   * get tiles
   * @returns {Array}
   * @private
   */
  _getTilesInternal () {
    const map = this.getMap();
    const size = map.getSize();
    const center = map.getCenter();
    const mapResolution = map.getResolution();
    const resolutions = map.getResolutions();
    const zoom = this._getNearestZoom(false);
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
        _tiles.push({
          z: zoom,
          x: i,
          y: j,
          id: zoom + ',' + i + ',' + j,
          url: url,
          size: scaledTileSize,
          extent: tileExtent,
          resolution: layerResolution
        });
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
    return [Math.floor(dx / (this.tileSize[0] * resolution)), Math.floor(dy / (this.tileSize[1] * resolution))];
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
