import { createCanvas, setStyle } from '../../utils'
import MapRenderer from '../Map'
import {resolutions} from '../../proj/constants';

class CanvasMapRenderer extends MapRenderer {
  /**
   * create render
   * @param container
   * @param map
   * @param extent
   * @returns {CanvasMapRenderer}
   */
  static create = (container, map, extent) => {
    return new CanvasMapRenderer(container, map, extent);
  };

  /**
   * check is canvas render
   * @param type
   * @returns {boolean}
   */
  static handles = type => {
    return type === 'canvas'
  };

  /**
   * constructor
   * @param container
   * @param map
   * @param extent
   */
  constructor (container, map, extent) {
    super(container, map);

    this.map = map;
    this.extent = extent;
    const size = map.getSize();

    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    this.canvas_ = createCanvas(size[0], size[1]);
    setStyle(this.canvas_, {
      width: '100%',
      height: '100%',
      display: 'block',
      userSelect: 'none'
    });

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.context = this.canvas_.getContext('2d');
    container.insertBefore(this.canvas_, container.childNodes[0] || null);

    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = true;

    /**
     * 渲染类型
     * @type {string}
     * @private
     */
    this._renderType = 'canvas';

    this.resolution = (this.extent[2] - this.extent[0]) / (this.canvas_.width);
    for (let i in resolutions) {
      if (resolutions[i] <= this.resolution) {
        this.resolution = resolutions[i];
        break;
      }
    }
    this.origin = [this.extent[0], this.extent[1]];
    this.extent[2] = this.extent[0] + this.resolution * this.canvas_.width;
    this.extent[1] = this.extent[3] - this.resolution * this.canvas_.height;
    this.draw();
  }

  getRenderer () {
    return this.renderer_;
  }

  render () {
    this.context.drawImage(this.canvas_, 0, 0);
    /* eslint no-useless-call: "off" */
    this.draw.call(this);
    window.requestAnimFrame(this.draw);
  }

  draw () {
    this.context.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    for (let i = 0; i < this.map.getLayers(); i++) {
      const _layer = this.map.getLayers()[i];
      _layer.render();
    }
  }
}

export default CanvasMapRenderer
