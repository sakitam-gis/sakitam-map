import { clamp, isNumber } from '../utils'
import Observable from '../events/Observable';
import {get} from '../proj';

class Base extends Observable {
  constructor (options = {}) {
    super();

    /**
     * this map
     * @type {null}
     * @private
     */
    this.map = null;

    /**
     * current layer opacity
     */
    options['opacity'] = isNumber(options['opacity']) ? options['opacity'] : 1;
    this.opacity = clamp(options['opacity'], 0, 1);

    /**
     * is can cross origin
     * @type {boolean}
     */
    this.crossOrigin = !!options.crossOrigin;

    /**
     * layer projection
     */
    this.projection = get(options['projection'] || 'EPSG:3857');

    /**
     * layer extent
     * @type {*|*[]}
     */
    this.extent = options['extent'] || this.projection.getExtent();

    /**
     * tile origin
     * @type {*}
     */
    this.origin = options.origin || [this.extent[0], this.extent[3]]; // left top

    /**
     * layer zIndex
     * @type {*|number}
     */
    this.zIndex = options['zIndex'] || 0;

    /**
     * render type
     * @type {*|string}
     */
    this.renderType = options['renderType'] || 'canvas';

    /**
     * render canvas
     * @type {null}
     * @private
     */
    this.canvas_ = null;
  }

  /**
   * return extent
   * @returns {*}
   */
  getExtent () {
    return this.extent;
  };

  /**
   *  Return the opacity of the layer (between 0 and 1).
   * @returns {number|*}
   */
  getOpacity () {
    return this.opacity;
  };

  /**
   * Return the Z-index of the layer, which is used to order layers before
   * rendering. The default Z-index is 0.
   * @return {number} The Z-index of the layer.
   * @observable
   * @api
   */
  getZIndex () {
    return this.zIndex;
  };

  /**
   * get render type
   * @returns {*|string}
   */
  getRenderType () {
    return this.renderType;
  }

  /**
   * Set the extent at which the layer is visible.  If `undefined`, the layer
   * will be visible at all extents.
   * @param extent
   */
  setExtent (extent) {
    this.extent = extent;
    // this.load();
  };

  /**
   * Set the opacity of the layer, allowed values range from 0 to 1.
   * @param {number} opacity The opacity of the layer.
   * @observable
   * @api
   */
  setOpacity (opacity) {
    this.opacity = opacity;
    // this.load();
  };

  /**
   * Set Z-index of the layer, which is used to order layers before rendering.
   * The default Z-index is 0.
   * @param {number} zindex The z-index of the layer.
   * @observable
   * @api
   */
  setZIndex (zindex) {
    this.zIndex = zindex;
    // this.load();
  }

  /**
   * set render type
   * @param type
   */
  setRenderType (type) {
    this.renderType = type || this.renderType;
  }

  /**
   * load layer
   */
  load () {}

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

  /**
   * get canvas context
   * @returns {HTMLCanvasElement}
   */
  getContext () {
    return this.canvas_.getContext('2d');
  }
}

export default Base
