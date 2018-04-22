import {create, setStyle, getTarget, isNull, createCanvas} from '../utils'
import Observable from '../events/Observable';
import {get as getProjection} from '../proj';

class Map extends Observable {
  constructor (target, options = {}) {
    super();
    /**
     * layer group
     * @type {Array}
     * @private
     */
    this._layers = options.layers || [];

    /**
     * Interactions
     * @type {*|Array}
     * @private
     */
    this._interactions = options['interactions'] || [];

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
     * resolutions
     */
    this.resolutions = options['resolutions'] || this.projection.getResolutions();

    /**
     * max resolution
     */
    this.maxResolution = options['maxResolution'] || this.resolutions[0];

    /**
     * min resolution
     */
    this.minResolution = options['minResolution'] || this.resolutions[this.resolutions.length - 1];

    /**
     * center
     * @type {*|number[]}
     * @private
     */
    this._center = options['center'] || [0, 0];

    /**
     * current zoom
     * @type {*|number}
     * @private
     */
    this._zoom = options['zoom'] || 0;

    /**
     * origin
     * @type {Array}
     */
    this.origin = [];

    /**
     * options
     * @type {{}}
     */
    this.options = options;

    /**
     * target id
     */
    this._id = target;
    this._createContent(target);
  }

  /**
   * creat dom content
   * @param target
   * @private
   */
  _createContent (target) {
    this.viewport_ = create('div', 'sakitam-map-container');
    const layersContent_ = create('div', 'sakitam-map-layers', this.viewport_);
    setStyle(this.viewport_, {
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      msTouchAction: 'none',
      touchAction: 'none'
    });
    setStyle(this.layersContent_, {
      position: 'absolute',
      overflow: 'hidden',
      width: '100%',
      height: '100%'
    });
    const _target = getTarget(target);
    _target.appendChild(this.viewport_);

    /**
     * map size
     * @type {*|string}
     */
    const size = this.getSize();

    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    const canvas_ = createCanvas(size[0], size[1], '');
    setStyle(canvas_, {
      width: '100%',
      height: '100%',
      display: 'block',
      userSelect: 'none'
    });

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.context = canvas_.getContext('2d');
    layersContent_.insertBefore(canvas_, layersContent_.childNodes[0] || null);

    /**
     * resolution
     * @type {number}
     */
    this.resolution = this.resolutions[this._zoom];
    this.origin = [this.extent[0], this.extent[3]];
    this.extent[2] = this.extent[0] + this.resolution * canvas_.width;
    this.extent[1] = this.extent[3] - this.resolution * canvas_.height;
    this.draw();
  }

  /**
   * 获取当前视图
   * @returns {*}
   */
  getViewport () {
    return this.viewport_
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
   * get pixel from event
   * @param event
   * @returns {*[]}
   */
  getEventPixel (event) {
    const viewportPosition = this.viewport_.getBoundingClientRect();
    const eventPosition = event.changedTouches ? event.changedTouches[0] : event;
    let pixelX = eventPosition.pageX ? eventPosition.pageX - document.body.scrollLeft - document.documentElement.scrollLeft : eventPosition.clientX;
    let pixelY = eventPosition.pageY ? eventPosition.pageY - document.body.scrollTop - document.documentElement.scrollTop : eventPosition.clientY;
    return [
      pixelX - viewportPosition.left + this.viewport_.clientLeft,
      pixelY - viewportPosition.top + this.viewport_.clientTop
    ];
  }

  /**
   * get coordinates from pixel
   * @param pixel
   * @returns {*[]}
   */
  getCoordinateFromPixel (pixel) {
    const size = this.getSize();
    const center = this.getCenter();
    const _resolution = this.getResolution();
    const halfSize = [size[0] / 2, size[1] / 2];
    return [
      (pixel[0] - halfSize[0]) * _resolution + center[0],
      (halfSize[1] - pixel[1]) * _resolution + center[1]
    ];
  }

  /**
   * get pixel from coordinates
   * @param coordinates
   * @returns {*[]}
   */
  getPixelFromCoordinate (coordinates) {
    const size = this.getSize();
    const halfSize = [size[0] / 2, size[1] / 2];
    const center = this.getCenter();
    const resolution = this.getResolution();
    return [
      halfSize[0] + (coordinates[0] - center[0]) / resolution,
      halfSize[1] - (coordinates[1] - center[1]) / resolution
    ];
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
    this.render();
  }

  /**
   * add interaction
   * @param interaction
   */
  addInteraction (interaction) {
    interaction.setMap(this);
    this._interactions.push(interaction);
  }

  /**
   * remove interaction
   * @param interaction
   */
  removeInteraction (interaction) {
    interaction.setMap(undefined);
    this._interactions = this._interactions.filter(_item => _item.getType() !== interaction.getType())
  }

  /**
   * get interaction from map
   * @returns {*|Array}
   */
  getInteractions () {
    return this._interactions;
  }

  /**
   * remove layer from map
   * @param layer
   * @returns {*}
   */
  removeLayer (layer) {
    if (!layer) return this;
    const layers = this.getLayers();
    return layers.remove(layer);
  }

  /**
   * get render context
   */
  getContext () {
    return this.context;
  }

  /**
   * get origin
   * @returns {Array}
   */
  getOrigin () {
    return this.origin;
  }

  /**
   * get extent
   * @returns {*|number[]}
   */
  getExtent () {
    return this.extent;
  }

  /**
   * render
   */
  render () {
    window.cancelAnimFrame(this._renderFrame);
    this._renderFrame = window.requestAnimFrame(this.draw, true, this);
  }

  /**
   * draw canvas
   */
  draw () {
    const _size = this.getSize();
    const _layers = this.getLayers();
    this.context.clearRect(0, 0, _size[0], _size[1]);
    for (let i = 0; i < _layers.length; i++) {
      const _layer = _layers[i];
      if (!_layer) {
        continue;
      }
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
   * calc current resolution
   * @param width
   * @param height
   * @returns {number}
   */
  calcResolution (width, height) {
    const size = this.getSize();
    const resW = width / size[0];
    const resH = height / size[1];
    return Math.max(resW, resH);
  }

  /**
   * re center
   * @param center
   */
  setCenter (center) {
    this._center = center;
    this.render();
  }

  /**
   * set zoom
   * @param zoom
   */
  setZoom (zoom) {
    const lastZoom = this.getZoom();
    let res = this._getNearestResolution(lastZoom, zoom, (zoom < lastZoom));
    res = res >= this.maxResolution ? this.maxResolution : (res <= this.minResolution ? this.minResolution : res);
    this.setResolution(res);
    this._zoom = zoom;
    this.render();
  }

  /**
   * zoom
   * @returns {*|number}
   */
  getZoom () {
    return this._zoom;
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

  /**
   * get current view center
   * @returns {*|number[]}
   */
  getCenter () {
    return this._center;
  }

  /**
   * get resolutions
   * @returns {*}
   */
  getResolutions () {
    return this.resolutions;
  }

  /**
   * get resolution
   * @returns {*}
   */
  getResolution () {
    return this.resolution;
  }

  /**
   * get current nearest zoom
   * @param greater
   * @returns {number}
   * @private
   */
  _getNearestZoom (greater) {
    const resolution = this.getResolution();
    const resolutions = this.getResolutions();
    let [newResolution, lastZoom] = [undefined, 0];
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

  /**
   * get nearest resolution
   * @param lastZoom
   * @param nextZoom
   * @param greater
   * @returns {*}
   * @private
   */
  _getNearestResolution (lastZoom, nextZoom, greater) {
    const lastResolution = this.getResolution();
    const resolutions = this.getResolutions();
    if (resolutions) {
      for (let i = 0, len = resolutions.length; i < len; i++) {
        const currentResolution = resolutions[i];
        if (Math.abs(currentResolution - lastResolution) < lastResolution / 1e2) {
          nextZoom = i + 1 >= len ? len - 1 : i + 1;
          return greater ? resolutions[lastZoom] : resolutions[nextZoom];
        } else if (currentResolution < lastResolution) {
          return greater ? resolutions[lastZoom] : currentResolution;
        } else {
          lastZoom = i;
        }
      }
    }
    return greater ? lastResolution * 2 : lastResolution / 2;
  }

  animate (options = {}) {
    if (!options.origin) {
      const size = this.getSize();
      options.origin = [size[0] / 2, size[1] / 2]
    }
    if (options.origin && options.center) {
      this._center = options.center;
    }
    this.setZoom(options.zoom);
    return this;
  }
}

export default Map
