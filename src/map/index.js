import { create, setStyle, getTarget, on, off, isNull } from '../utils'
import CanvasMapRenderer from '../render/canvas/Map'
import Observable from '../events/Observable';

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
    this.layersContent_ = create('div', 'sakitam-map-layers', this.viewport_);
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

    /**
     * target
     * @type {*}
     * @private
     */
    this._target = getTarget(target);
    this._target.appendChild(this.viewport_);
    this._initRender(target);
    on(this.viewport_, 'contextmenu', this.handleBrowserEvent, this);
    on(this.viewport_, 'wheel', this.handleBrowserEvent, this);
    on(this.viewport_, 'mousewheel', this.handleBrowserEvent, this)
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
   * init render
   * @param target
   * @private
   */
  _initRender (target) {
    this.renderer = CanvasMapRenderer.create(this.layersContent_, this, this.options);
    this.dispatch('load', this.renderer);
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

  getPixelFromCoordinate (coordinate) {
  }

  /**
   * set map cursor
   * @param cursor
   * @returns {Map}
   */
  setCursor (cursor) {
    delete this._cursor;
    this._cursor = cursor;
    return this;
  }

  /**
   * Reset map's cursor style.
   * @returns {*}
   */
  resetCursor () {
    return this.setCursor(null);
  }

  /**
   * dispose events internal
   */
  disposeInternal () {
    off(this.viewport_, 'contextmenu', this.handleBrowserEvent, this);
    off(this.viewport_, 'wheel', this.handleBrowserEvent, this);
    off(this.viewport_, 'mousewheel', this.handleBrowserEvent, this)
  }

  /**
   * 容器
   * @returns {*}
   */
  getTarget () {
    return this._target;
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
    // if (!Array.isArray(layer)) {
    //   layer = Array.prototype.slice.call(arguments, 0);
    //   return this.addLayer(layer);
    // }
    layer.setMap(this);
    this._layers.push(layer);
    this.renderer.render();
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
    if (!Array.isArray(layer)) {
      layer = Array.prototype.slice.call(arguments, 0);
      return this.removeLayer(layer);
    }
    const layers = this.getLayers();
    return layers.remove(layer);
  }

  /**
   * get render context
   */
  getContext () {
    return this.renderer.context;
  }

  /**
   * get origin
   * @returns {Array}
   */
  getOrigin () {
    return this.renderer.origin;
  }

  /**
   * get extent
   * @returns {*|number[]}
   */
  getExtent () {
    return this.renderer.extent;
  }

  /**
   * get resolutions
   * @returns {*}
   */
  getResolutions () {
    return this.renderer.resolutions;
  }

  /**
   * get resolution
   * @returns {*}
   */
  getResolution () {
    return this.renderer.resolution;
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
