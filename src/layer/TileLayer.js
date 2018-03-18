import Base from './Base';
import {isNull} from '../utils';

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
  }

  load () {
    if (!this.getMap()) {
      return this;
    }
    if (this.onLoad()) {
      this._initRenderer();
      const zIndex = this.getZIndex();
      if (!isNull(zIndex)) {
        this._renderer.setZIndex(zIndex);
        if (!this.isCanvasRender()) {
          this._renderer.render();
        }
      }
    }
    return this;
  }

  render () {
    if (this.parentMap) {
      for (var i in this._imageList) {
        var _image = this._imageList[i];
        var context = this.parentMap._context;
        if (_image.isonload === true) {
          context.drawImage(_image.image, 0, 0, this.picWidth, this.picHeight, _image.x, _image.y, this.picWidth / this.scaleRate, this.picHeight / this.scaleRate);
        }
      }
    }
  }

  getTileInternal (z, x, y, pixelRatio) {
  }

  getTile (z, x, y, pixelRatio, projection) {
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
