import { get as getProjection } from '../../proj'
import { createCanvas, setStyle } from '../../utils'
import Observable from '../../events/Observable';

class CanvasMapRenderer extends Observable {
  /**
   * create render
   * @param container
   * @param map
   * @param options
   * @returns {CanvasMapRenderer}
   */
  static create = (container, map, options = {}) => {
    return new CanvasMapRenderer(container, map, options);
  };

  /**
   * constructor
   * @param container
   * @param map
   * @param options
   */
  constructor (container, map, options) {
    super();

    this.map = map;

    /**
     * layer projection
     */
    this.projection = getProjection(options['projection'] || 'EPSG:3857');

    /**
     * map extent
     * @type {*|string}
     */
    this.extent = options['extent'] || this.projection.getFullExtent();

    /**
     * map size
     * @type {*|string}
     */
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
     * 渲染类型
     * @type {string}
     * @private
     */
    this._renderType = 'canvas';

    /**
     * resolutions
     */
    this.resolutions = options['resolutions'] || this.projection.getResolutions();

    this.resolution = (this.extent[2] - this.extent[0]) / (this.canvas_.width);
    for (let i in this.resolutions) {
      if (this.resolutions[i] <= this.resolution) {
        this.resolution = this.resolutions[i];
        break;
      }
    }
    this.origin = [this.extent[0], this.extent[3]];
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
    this.draw();
    window.requestAnimFrame(this.draw.bind(this));
  }

  draw () {
    const _size = this.map.getSize();
    const _layers = this.map.getLayers();
    this.context.clearRect(0, 0, _size[0], _size[1]);
    for (let i = 0; i < _layers.length; i++) {
      const _layer = _layers[i];
      _layer.load();
    }
  }

  /**
   * set resolution
   * @param resolution
   */
  setResolution (resolution) {
    this.resolution = resolution;
  }

  /**
   * set origin
   * @param origin
   */
  setOrigin (origin) {
    this.origin = origin;
  }

  /**
   * extent
   * @param extent
   */
  setExtent (extent) {
    this.extent = extent;
    this.draw();
  }
}

export default CanvasMapRenderer
