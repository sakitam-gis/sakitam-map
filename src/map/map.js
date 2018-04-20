import {create, setStyle, getTarget, on, off, isNull, createCanvas} from '../utils'
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
    on(this.viewport_, 'contextmenu', this.handleBrowserEvent, this);
    on(this.viewport_, 'wheel', this.handleBrowserEvent, this);
    on(this.viewport_, 'mousewheel', this.handleBrowserEvent, this);
    on(this.viewport_, 'mousedown', this.handleBrowserEvent, this);
    this.draw();
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
   * @param coordinates
   * @returns {*[]}
   */
  getPixelFromCoordinate (coordinates) {
    const size = this.getSize();
    const center = this.getCenter();
    const resolution = this.getResolution();
    let [x, y] = [
      size[0] / 2 + (coordinates[0] - center[0]) / resolution,
      size[1] / 2 - (coordinates[1] - center[1]) / resolution
    ];
    return [x, y];
  }

  /**
   * dispose events internal
   */
  disposeInternal () {
    off(this.viewport_, 'contextmenu', this.handleBrowserEvent, this);
    off(this.viewport_, 'wheel', this.handleBrowserEvent, this);
    off(this.viewport_, 'mousewheel', this.handleBrowserEvent, this);
    off(this.viewport_, 'mousedown', this.handleBrowserEvent, this);
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
    this.draw();
    window.requestAnimFrame(this.draw.bind(this));
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
   * handle event
   * @param browserEvent
   * @param _type
   */
  handleBrowserEvent (browserEvent, _type) {
    const interactionsArray = this.getInteractions();
    const type = _type || browserEvent.type;
    console.log(type, this)
    for (let i = interactionsArray.length - 1; i >= 0; i--) {
      const interaction = interactionsArray[i];
      if (!interaction.getActive()) {
        continue;
      }
      const cont = interaction.handleEvent(browserEvent);
      if (!cont) {
        break;
      }
    }
  }
}

export default Map
