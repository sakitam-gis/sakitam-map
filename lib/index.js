import Observable from '../src/events/Observable';
import {create, getTarget, isNull, setStyle, createCanvas} from '../src/utils';
import {get as getProjection} from '../src/proj';
import ajax from '../src/utils/ajax';
const RADIUS = 6378137;
const MAX = 85.0511287798;
const RADIANS = Math.PI / 180;

class VectorLayer {
  constructor (options = {}) {
    this._data = options['data'] || {}
  }

  /**
   * create
   */
  create () {
    this.scale = Math.pow(2, parseInt(this.map.getZoom()));
    this.bounds = this.getBounds();
    this.width = Math.ceil(256 * this.scale);
    this.height = Math.ceil(this.width / 1.041975309);
    this.center = this.getPixelFromCoordinate(this.map.getCenter());
    this.context = this.map.getContext();
  }

  /**
   * draw geojson
   */
  draw () {
    this.create();
    this.context.fillStyle = '#08304b';
    for (let i = 0; i < this._data.length; i++) {
      const coords = this._data[i].geometry.coordinates[0];
      for (let j = 0; j < coords.length; j++) {
        const point = this.getPixelFromCoordinate([coords[j][1], coords[j][0]]);
        if (j === 0) {
          this.context.beginPath();
          this.context.moveTo(point[0], point[1]);
        } else {
          this.context.lineTo(point[0], point[1]);
        }
      }
      this.context.fill();
    }
  }

  /**
   * get data bounds
   * @returns {*[]}
   */
  getBounds () {
    const arr = [];
    for (let i = 0; i < this._data.length; i++) {
      let coords = this._data[i].geometry.coordinates[0];
      for (let j = 0; j < coords.length; j++) {
        const point = this.map.project([coords[j][1], coords[j][0]]);
        arr.push(point);
      }
    }
    let minX = arr.reduce((a, b) => a[0] < b[0] ? a : b)[0];
    let maxX = arr.reduce((a, b) => a[0] > b[0] ? a : b)[0];
    let minY = arr.reduce((a, b) => a[1] < b[1] ? a : b)[1];
    let maxY = arr.reduce((a, b) => a[1] > b[1] ? a : b)[1];
    return [minX, minY, maxX, maxY];
  }

  /**
   * get pixel from coordinates
   * @param coordinate
   * @returns {*[]}
   */
  getPixelFromCoordinate (coordinate) {
    const size = this.map.getSize();
    const point = this.map.project(coordinate);
    const xScale = size[0] / Math.abs(this.bounds[2] - this.bounds[0]);
    const yScale = size[1] / Math.abs(this.bounds[3] - this.bounds[1]);
    const scale = xScale < yScale ? xScale : yScale;
    return [(point[0] - this.bounds[0]) * scale, (this.bounds[3] - point[1]) * scale];
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    this.map = map;
    this.draw();
  }

  /**
   * get map
   * @returns {*}
   */
  getMap () {
    return this.map;
  }
}

class SampleMap extends Observable {
  static VectorLayer = VectorLayer;
  static ajax = ajax;
  constructor (target, options) {
    super();

    /**
     * layer group
     * @type {Array}
     * @private
     */
    this._layers = options.layers || [];

    /**
     * content target
     */
    this._target = target;

    /**
     * layer projection
     */
    this.projection = getProjection(options['projection'] || 'EPSG:3857');

    /**
     * map
     * zoom
     * @type {*|number}
     * @private
     */
    this._zoom = options['zoom'] || 0;

    /**
     * map center
     * @type {*|number[]}
     */
    this._center = options['center'] || [0, 0];

    /**
     * options
     */
    this._options = options;
    this._createContent(target);
  }

  /**
   * creat dom content
   * @param target
   * @private
   */
  _createContent (target) {
    this.viewport_ = create('div', 'sample-map-container');
    setStyle(this.viewport_, {
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      msTouchAction: 'none',
      touchAction: 'none'
    });

    /**
     * target
     * @type {*}
     * @private
     */
    this._target = getTarget(target);
    this._target.appendChild(this.viewport_);

    /**
     * map size
     * @type {*|string}
     */
    const size = this.getSize();

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
    this.viewport_.insertBefore(this.canvas_, this.viewport_.childNodes[0] || null);
    this.render();
  }

  /**
   * get canvas context
   * @returns {HTMLCanvasElement}
   */
  getContext () {
    return this.context;
  }

  /**
   * render
   */
  render () {
    const size = this.getSize();
    // Draw the water first
    this.context.fillStyle = '#021019';
    this.context.fillRect(0, 0, size[0], size[1]);
  }

  /**
   * get map size
   * @returns {*}
   */
  getSize () {
    if (!this.viewport_) {
      return null;
    }
    const container_ = this.viewport_;
    let width, height;
    if (!isNull(container_.width) && !isNull(container_.height)) {
      width = container_.width;
      height = container_.height;
    } else if (!isNull(container_.clientWidth) && !isNull(container_.clientHeight)) {
      width = parseInt(container_.clientWidth, 0);
      height = parseInt(container_.clientHeight, 0);
    } else {
      throw new Error('can not get size of container');
    }
    return [width, height];
  }

  /**
   * get options
   * @returns {*}
   */
  getOptions () {
    return this._options
  }

  /**
   * get center
   * @returns {*}
   */
  getCenter () {
    return this._center;
  }

  /**
   * set center
   * @param center
   */
  setCenter (center) {
    this._center = center;
  }

  /**
   * get zoom
   * @returns {*}
   */
  getZoom () {
    return this._zoom;
  }

  /**
   * set zoom
   * @param zoom
   */
  setZoom (zoom) {
    this._zoom = zoom;
  }

  /**
   * get map projection
   * @returns {*}
   */
  getProjection () {
    return this.projection;
  }

  /**
   * get pixel from event
   * @param event
   * @returns {*[]}
   */
  getEventPixel (event) {
    const viewportPosition = this.viewport_.getBoundingClientRect();
    const eventPosition = event.changedTouches ? event.changedTouches[0] : event;
    return [
      eventPosition.clientX - viewportPosition.left,
      eventPosition.clientY - viewportPosition.top
    ];
  }

  /**
   * get coordinates from pixel
   * @param pixel
   * @returns {*[]}
   */
  getCoordinateFromPixel (pixel) {
    const _origin = this.getOrigin();
    const _resolution = this.getResolution();
    let x = pixel[0] * _resolution + _origin[0];
    let y = _origin[1] - pixel[1] * _resolution;
    return [x, y];
  }

  /**
   * get pixel from coordinates
   * @param coordinate
   * @returns {*[]}
   */
  getPixelFromCoordinate (coordinate) {
    const size = this.getSize();
    const point = this.project(coordinate);
    const xScale = size[0] / Math.abs(this.bounds[2] - this.bounds[0]);
    const yScale = size[1] / Math.abs(this.bounds[3] - this.bounds[1]);
    const scale = xScale < yScale ? xScale : yScale;
    return [(point[0] - this.bounds[0]) * scale, (this.bounds[3] - point[1]) * scale];
  }

  /**
   * get layer group
   * @returns {Array}
   */
  getLayers () {
    return this._layers;
  }

  /**
   * add layer to map
   * @param layer
   * @returns {*}
   */
  addLayer (layer) {
    if (!layer) return this;
    layer.setMap(this);
    this._layers.push(layer);
  }

  /**
   * project
   * @param coordinates
   * @returns {*[]}
   */
  project (coordinates) {
    let x = RADIUS * coordinates[1] * RADIANS;
    let y = Math.max(Math.min(MAX, coordinates[0]), -MAX) * RADIANS;
    y = RADIUS * Math.log(Math.tan((Math.PI / 4) + (y / 2)));
    return [x, y];
  }
}

export default SampleMap
