import ajax from '../../utils/ajax';

class Tile {
  constructor (url, x, y, z, xmin, ymax, context, crossOrigin) {
    const that = this;
    this.tile = new Image();
    ajax.getImage(this.tile, url);
    this.tile.onload = function () {
      that.isLoad = true;
      that.update();
    };
    if (crossOrigin) {
      this.tile.crossOrigin = 'Anonymous'
    }
    this.xmin = xmin;
    this.ymax = ymax;
    this.x = x;
    this.y = y;
    this.level = z;
    this.isLoad = true;
    this.layer = context;
  }

  update () {
    const map = this.layer.getMap();
    if (this.layer.getMap()) {
      const origin = map.getOrigin();
      this.offsetX = (this.xmin - origin[0]) / map.getResolution();
      this.offsetY = (origin[1] - this.ymax) / map.getResolution();
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

  /**
   * offset
   * @returns {*[]}
   */
  getOffset () {
    return [this.offsetX, this.offsetY];
  }
}

export default Tile
