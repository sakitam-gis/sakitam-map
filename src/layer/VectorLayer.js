import Base from './Base';
import { createCanvas, isEmpty } from '../utils';
import ajax from '../utils/ajax';
import { fromLonLat } from '../proj'

class VectorLayer extends Base {
  constructor (options = {}) {
    super(options);

    /**
     * layer service url
     * @type {*|string}
     */
    this.url = options['url'] || '';

    /**
     * context
     * @type {null}
     */
    this.context = null;

    /**
     * render canvas
     * @type {null}
     * @private
     */
    this.canvas_ = null;

    /**
     * json data
     * @type {*|{}}
     * @private
     */
    this._data = options['data'] || {};
  }

  /**
   * load layer
   * @returns {VectorLayer}
   */
  load () {
    if (!this.getMap()) {
      return this;
    }

    /**
     * map size
     * @type {*|string}
     */
    const size = this.getMap().getSize();
    if (!this.canvas_) {
      this.canvas_ = createCanvas(size[0], size[1]);
    } else {
      this.canvas_.width = size[0];
      this.canvas_.height = size[1];
    }
    if (this.url && isEmpty(this._data)) {
      ajax.getJSON(this.url).then(res => {
        if (res.data && res.data.features) {
          this._data = res.data.features;
          this.render();
        }
      })
    } else {
      this.render();
    }
    return this;
  }

  /**
   * re render
   */
  render () {
    const map = this.getMap();
    const size = map.getSize();
    const context = this.getContext() || map.getContext();
    context.save();
    context.globalAlpha = this.getOpacity();
    context.fillStyle = '#08304b';
    for (let i = 0; i < this._data.length; i++) {
      const coords = this._data[i].geometry.coordinates[0];
      for (let j = 0; j < coords.length; j++) {
        const point = map.getPixelFromCoordinate(fromLonLat([coords[j][1], coords[j][0]]));
        if (j === 0) {
          context.beginPath();
          context.moveTo(point[0], point[1]);
        } else {
          context.lineTo(point[0], point[1]);
        }
      }
      context.fill();
    }
    context.restore();
    if (this.getContext()) {
      map.getContext().drawImage(this.canvas_, 0, 0, size[0], size[1])
    }
  }

  /**
   * get canvas context
   * @returns {HTMLCanvasElement}
   */
  getContext () {
    return this.context;
  }
}

export default VectorLayer
