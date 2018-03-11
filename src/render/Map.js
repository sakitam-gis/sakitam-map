import Observable from '../events/Observable'
class MapRenderer extends Observable {
  constructor (container, map) {
    super();

    /**
     * map
     */
    this.map_ = map;

    /**
     * 渲染类型
     * @type {string}
     * @private
     */
    this._renderType = 'canvas'
  }

  /**
   * get map
   * @returns {Map}
   */
  getMap () {
    return this.map_;
  }

  getType () {
    return this._renderType
  }
}

export default MapRenderer
