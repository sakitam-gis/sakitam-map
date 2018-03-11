import { createCanvas, setStyle } from '../../utils'
import MapRenderer from '../Map.js'

class CanvasMapRenderer extends MapRenderer {
  /**
   * creat render
   * @param container
   * @param map
   * @returns {CanvasMapRenderer}
   */
  static create = (container, map) => {
    return new CanvasMapRenderer(container, map);
  };

  /**
   * check is canvas render
   * @param type
   * @returns {boolean}
   */
  static handles = type => {
    return type === 'canvas'
  };

  /**
   * constructor
   * @param container
   * @param map
   */
  constructor (container, map) {
    super(container, map);

    const size = map.getSize();

    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    this.canvas_ = createCanvas(size[0], size[1]);
    setStyle(this.canvas_, {
      width: '100%',
      height: '100%',
      display: 'block',
      userSelect: 'none'
    });

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.context = this.canvas_.getContext('2d');
    container.insertBefore(this.canvas_, container.childNodes[0] || null);

    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = true;

    /**
     * 渲染类型
     * @type {string}
     * @private
     */
    this._renderType = 'canvas'
  }
}

export default CanvasMapRenderer
