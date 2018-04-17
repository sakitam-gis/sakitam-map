import { clamp } from '../utils'
import Observable from '../events/Observable';
import {get} from "../proj";

class Base extends Observable {
  constructor (options = {}) {
    super();

    /**
     * this map
     * @type {null}
     * @private
     */
    this._map = null;

    /**
     * current layer opacity
     */
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
   * Set the extent at which the layer is visible.  If `undefined`, the layer
   * will be visible at all extents.
   * @param extent
   */
  setExtent (extent) {
    this.extent = extent;
  };

  /**
   * Set the opacity of the layer, allowed values range from 0 to 1.
   * @param {number} opacity The opacity of the layer.
   * @observable
   * @api
   */
  setOpacity (opacity) {
    this.opacity = opacity;
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

export default Base
