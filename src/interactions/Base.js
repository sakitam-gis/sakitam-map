import Observable from '../events/Observable';

class Base extends Observable {
  constructor (options = {}) {
    super()

    /**
     * is active
     * @type {boolean}
     * @private
     */
    this._active = options.hasOwnProperty('active') ? options['active'] : true;

    /**
     * interacyion type
     * @type {string}
     * @private
     */
    this._type = '';
  }

  /**
   * mounted interaction
   */
  mounted () {}

  /**
   * destroyed interaction
   */
  destroyed () {}

  /**
   * check interaction is active
   * @returns {*}
   */
  getActive () {
    return this._active;
  }

  /**
   * set active
   * @param active
   */
  setActive (active) {
    this._active = active;
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    if (map) {
      this._map = map;
      this.mounted();
    } else {
      this.destroyed();
      this._map = map;
    }
  }

  /**
   * get map
   * @returns {*}
   */
  getMap () {
    return this._map;
  }

  /**
   * interaction type
   * @returns {*}
   */
  getType () {
    return this._type;
  }
}

export default Base
