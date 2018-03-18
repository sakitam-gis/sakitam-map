import Base from './Base';

class TileLayer extends Base {
  constructor (options = {}) {
    super(options);

    /**
     * is can cross origin
     * @type {boolean}
     */
    this.crossOrigin = !!options.crossOrigin;

    this.
  }

  getTileInternal (z, x, y, pixelRatio) {

  }

  canExpireCache () {
    if (this.tileCache.canExpireCache()) {
      return true;
    } else {
      for (const key in this.tileCacheForProjection) {
        if (this.tileCacheForProjection[key].canExpireCache()) {
          return true;
        }
      }
    }
    return false;
  }

  expireCache (projection, usedTiles) {
    const usedTileCache = this.getTileCacheForProjection(projection);
    this.tileCache.expireCache(this.tileCache === usedTileCache ? usedTiles : {});
    for (const id in this.tileCacheForProjection) {
      const tileCache = this.tileCacheForProjection[id];
      tileCache.expireCache(tileCache === usedTileCache ? usedTiles : {});
    }
  }
}
