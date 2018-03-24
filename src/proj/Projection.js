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
     * full extent
     * @type {null}
     * @private
     */
    this.fullExtent_ = options.fullExtent !== undefined ? options.fullExtent : null;

    /**
     * @private
     * @type {string}
     */
    this.axisOrientation_ = options.axisOrientation !== undefined ? options.axisOrientation : 'enu';

    /**
     * @private
     * @type {function(number):number|undefined}
     */
    this.getPointResolutionFunc_ = options.getPointResolution;

    /**
     * resolutions
     */
    this.resolutions_ = options.resolutions;

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

  getFullExtent (extent) {
    return this.fullExtent_;
  }

  getUnits () {
    return this.units_;
  }

  getMetersPerUnit () {
    return this.metersPerUnit_ || METERS_PER_UNIT[this.units_];
  }

  getResolutions () {
    return this.resolutions_;
  }

  setResolutions (resolutions) {
    this.resolutions_ = resolutions
  }

  getAxisOrientation () {
    return this.axisOrientation_;
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

  setFullExtent (extent) {
    this.fullExtent_ = extent;
  }

  setGetPointResolution (func) {
    this.getPointResolutionFunc_ = func;
  }

  getPointResolutionFunc () {
    return this.getPointResolutionFunc_;
  }
}

export default Projection
