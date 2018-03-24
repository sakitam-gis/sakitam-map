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
}

export default Base
