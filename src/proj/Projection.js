import {METERS_PER_UNIT} from './constants'
class Projection {
  constructor (options) {
    /**
     * @private
     * @type {string}
     */
    this.code_ = options.code;

    /**
     * @private
     * @type {*}
     */
    this.units_ = options.units;

    /**
     * @private
     * @type {Array}
     */
    this.extent_ = options.extent !== undefined ? options.extent : null;

    /**
     * @private
     * @type {Array}
     */
    this.worldExtent_ = options.worldExtent !== undefined ? options.worldExtent : null;

    /**
     * @private
     * @type {string}
     */
    this.axisOrientation_ = options.axisOrientation !== undefined ? options.axisOrientation : 'enu';

    /**
     * @private
     * @type {boolean}
     */
    this.global_ = options.global !== undefined ? options.global : false;

    /**
     * @private
     * @type {function(number):number|undefined}
     */
    this.getPointResolutionFunc_ = options.getPointResolution;

    /**
     * @private
     * @type {*}
     */
    this.defaultTileGrid_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.metersPerUnit_ = options.metersPerUnit;
  }

  getCode () {
    return this.code_;
  }

  getExtent () {
    return this.extent_;
  }

  getUnits () {
    return this.units_;
  }

  getMetersPerUnit () {
    return this.metersPerUnit_ || METERS_PER_UNIT[this.units_];
  }

  getWorldExtent () {
    return this.worldExtent_;
  }

  getAxisOrientation () {
    return this.axisOrientation_;
  }

  isGlobal () {
    return this.global_;
  }

  setGlobal (global) {
    this.global_ = global;
  }

  getDefaultTileGrid () {
    return this.defaultTileGrid_;
  }

  setDefaultTileGrid (tileGrid) {
    this.defaultTileGrid_ = tileGrid;
  }

  setExtent (extent) {
    this.extent_ = extent;
  }

  setWorldExtent (worldExtent) {
    this.worldExtent_ = worldExtent;
  }

  setGetPointResolution (func) {
    this.getPointResolutionFunc_ = func;
  }

  getPointResolutionFunc () {
    return this.getPointResolutionFunc_;
  }
}

export default Projection
