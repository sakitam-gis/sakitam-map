import { create, setStyle, getTarget, on, off } from '../utils'

class SMap {
  constructor (target, options = {}) {
    /**
     * layer group
     * @type {Array}
     * @private
     */
    this._layerGroup = []
    this._createContent(target)
  }

  /**
   * creat dom content
   * @param target
   * @private
   */
  _createContent (target) {
    this.viewport_ = create('div', 'sakitam-map-container');
    this.layersContent_ = create('div', 'sakitam-map-container-layers', this.viewport_)
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
    this._target = getTarget(target)
    this._target.appendChild(this.viewport_)
    on(this.viewport_, 'contextmenu', this.handleBrowserEvent, this);
    on(this.viewport_, 'wheel', this.handleBrowserEvent, this);
    on(this.viewport_, 'mousewheel', this.handleBrowserEvent, this)
  }

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
  getLayerGroup () {
    return this._layerGroup;
  }

  /**
   * get layers
   * @returns {*}
   */
  getLayers () {
    return this.getLayerGroup().getLayers();
  }

  /**
   * add layer to map
   * @param layer
   * @returns {*}
   */
  addLayer (layer) {
    if (!layer) return this;
    if (!Array.isArray(layer)) {
      layer = Array.prototype.slice.call(arguments, 0);
      return this.addLayer(layer);
    }
    const layers = this.getLayerGroup().getLayers();
    layers.push(layer);
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
    const layers = this.getLayerGroup().getLayers();
    return layers.remove(layer);
  }

  /**
   * handle event
   * @param browserEvent
   * @param _type
   */
  handleBrowserEvent (browserEvent, _type) {
    const type = _type || browserEvent.type;
    console.log(type, this)
  }
}

export default SMap
