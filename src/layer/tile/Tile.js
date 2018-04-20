// import ajax from '../../utils/ajax';
import Observable from '../../events/Observable';

class Tile extends Observable {
  constructor (url, x, y, z, id, layer) {
    super();
    const that = this;
    this.tile = new Image();
    // ajax.getImage(this.tile, url);
    this.tile.onload = function () {
      that.isLoad = true;
      that.dispatch('load', this);
      if (layer.getMap()) {
        const context = layer.getMap().getContext();
        layer._drawTile(that, context);
      }
    };
    this.tile.src = url;
    if (layer.crossOrigin) {
      this.tile.crossOrigin = 'Anonymous'
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
    this.isLoad = false;
  }

  /**
   * 是否加载完毕
   * @returns {boolean}
   */
  isLoaded () {
    return this.isLoad;
  }

  /**
   * get image
   * @returns {Image|HTMLImageElement}
   */
  getImage () {
    return this.tile
  }
}

export default Tile
