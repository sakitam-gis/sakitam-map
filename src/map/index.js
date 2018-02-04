import { create, setStyle, getTarget } from '../utils'

class SMap {
  constructor (target, options = {}) {
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
  }

  /**
   * 容器
   * @returns {*}
   */
  getTarget () {
    return this._target
  }
}

export default SMap
