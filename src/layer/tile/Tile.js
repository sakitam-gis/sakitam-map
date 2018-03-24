import ajax from '../../utils/ajax';
import Observable from '../../events/Observable';

class Tile extends Observable {
  constructor (url, x, y, z, xmin, ymax, context, crossOrigin) {
    super()
    const that = this;
    this.tile = new Image();
    ajax.getImage(this.tile, url);
    this.tile.onload = function () {
      that.getTileOffset();
      that.isLoad = true;
      that.dispatch('load', this);
    };
    if (crossOrigin) {
      this.tile.crossOrigin = 'Anonymous'
    }
    this.xmin = xmin;
    this.ymax = ymax;
    this.x = x;
    this.y = y;
    this.z = z;
    this.isLoad = false;
    this.layer = context;
  }

  /**
   * get tile offset
   * @returns {*[]}
   */
  getTileOffset () {
    const map = this.layer.getMap();
    if (this.layer.getMap()) {
      const origin = map.getOrigin();
      return [(this.xmin - origin[0]) / map.getResolution(), (origin[1] - this.ymax) / map.getResolution()];
    }
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
