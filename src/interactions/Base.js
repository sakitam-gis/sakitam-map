import Observable from '../events/Observable';

class Base extends Observable {
  constructor (options = {}) {
    super()
    this._active = options.hasOwnProperty('active') ? options['active'] : true;
  }

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
    this._map = map;
  }

  /**
   * get map
   * @returns {*}
   */
  getMap () {
    return this._map;
  }
}

export default Base
